'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { OAuthLoginButton } from "./oauth-login-button"
import { PasswordInput } from "@/components/ui/password-input"
import { SignInState, signIn } from "../actions"
import { useActionState, useState } from "react"
import { FormErrorMessage } from "@/components/ui/form-error-message"

const initialState: SignInState = {
    email: "",
    password: "",
    error: "",
};

export function SigninForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [formState, formAction, isPending] = useActionState(signIn, initialState);

    const [hasTyped, setHasTyped] = useState(false);

    function handleChange() {
        setHasTyped(true);
    }

    const handleSubmit = async (formData: FormData) => {
        setHasTyped(false); // Reset typing state on submit
        return formAction(formData);
    };

    const showError = formState.error && !hasTyped;

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email below to sign-in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name='email'
                                    placeholder="m@example.com"
                                    required
                                    defaultValue={formState.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {/* <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a> */}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    defaultValue={formState.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {showError && <FormErrorMessage>{formState.error}</FormErrorMessage>}
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Signing in..." : "Sign in"}
                            </Button>
                            <OAuthLoginButton disabled={isPending} />
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up" className="underline underline-offset-4">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
