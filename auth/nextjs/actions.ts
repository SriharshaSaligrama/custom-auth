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
import { Expand } from "@/types/expand"

export type SignInState = {
    email: string;
    password: string;
    error?: string;
};

export type SignUpState = Expand<{
    name: string;
} & SignInState>;

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

export async function signUp(prevState: SignUpState, formData: FormData) {
    const unsafeData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
    }
    // unsafeData: z.infer<typeof signUpSchema>
    const { success, data } = signUpSchema.safeParse(unsafeData)

    if (!success) return {
        name: unsafeData.name,
        email: unsafeData.email,
        password: unsafeData.password,
        error: "Unable to create account! Invalid fields."
    } as SignUpState

    const existingUser = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, data.email),
    })

    if (existingUser != null) return {
        ...data,
        error: "Account already exists for this email"
    } as SignUpState

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

        if (user == null) return {
            ...data,
            error: "Something went wrong! Please try again."
        } as SignUpState
        await createUserSession(user, await cookies())
    } catch {
        return {
            ...data,
            error: "Something went wrong! Please try again."
        } as SignUpState
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