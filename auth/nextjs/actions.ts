"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { signInSchema, signUpSchema } from "./form-validators"
import { db } from "@/db"
import { OAuthProvider, UserTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
    comparePasswords,
    generateSalt,
    hashPassword,
} from "../core/password-hasher"
import { cookies } from "next/headers"
import { createUserSession, removeUserFromSession } from "../core/session"
import { getOAuthClient } from "../core/oauth/base"

export type SignInState = {
    email: string;
    password: string;
    error?: string;
};

export type SignUpState = {
    name: string;
} & SignInState;

export async function signIn(prevState: SignInState, formData: FormData) {
    const unsafeData = {
        email: formData.get("email"),
        password: formData.get("password")
    }
    // unsafeData: z.infer<typeof signInSchema>
    const { success, data } = signInSchema.safeParse(unsafeData)

    if (!success) return {
        email: unsafeData.email,
        password: unsafeData.password,
        error: "Invalid credentials!",
    } as SignInState

    const user = await db.query.UserTable.findFirst({
        columns: { password: true, salt: true, id: true, email: true, role: true },
        where: eq(UserTable.email, data.email),
    })

    if (user == null || user.password == null || user.salt == null) {
        return {
            email: data.email,
            password: data.password,
            error: "Unregistered email. Please sign up!",
        } as SignInState
    }

    const isCorrectPassword = await comparePasswords({
        hashedPassword: user.password,
        password: data.password,
        salt: user.salt,
    })

    if (!isCorrectPassword) return {
        email: user.email,
        password: data.password,
        error: "Invalid credentials!",
    } as SignInState

    await createUserSession(user, await cookies())

    redirect("/")
}

export async function signUp(unsafeData: z.infer<typeof signUpSchema>) {
    const { success, data } = signUpSchema.safeParse(unsafeData)

    if (!success) return "Unable to create account"

    const existingUser = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, data.email),
    })

    if (existingUser != null) return "Account already exists for this email"

    try {
        const salt = generateSalt()
        const hashedPassword = await hashPassword(data.password, salt)

        const [user] = await db
            .insert(UserTable)
            .values({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                salt,
            })
            .returning({ id: UserTable.id, role: UserTable.role })

        if (user == null) return "Unable to create account"
        await createUserSession(user, await cookies())
    } catch {
        return "Unable to create account"
    }

    redirect("/")
}

export async function logOut() {
    await removeUserFromSession(await cookies())
    redirect("/")
}

export async function oAuthSignIn(provider: OAuthProvider) {
    const oAuthClient = getOAuthClient(provider)
    redirect(oAuthClient.createAuthUrl(await cookies()))
}