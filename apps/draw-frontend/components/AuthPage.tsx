"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import Link from "next/link";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md">

                {/* Header */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        {isSignin ? "Sign in to Draw RTC" : "Create your Draw RTC account"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        {isSignin
                            ? "Welcome back! Please enter your details."
                            : "Get started with real-time collaborative drawing."}
                    </p>
                </CardHeader>

                {/* Content */}
                <CardContent>
                    <form className="space-y-4">

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Button */}
                        <Button className="w-full h-11 mt-2">
                            {isSignin ? "Sign in" : "Sign up"}
                        </Button>
                    </form>

                    {/* Footer text */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {isSignin ? "Don’t have an account?" : "Already have an account?"}{" "}
                        <Link
                            href={isSignin ? "/signup" : "/signin"}
                            className="text-primary hover:underline font-medium"
                        >
                            {isSignin ? "Sign up" : "Sign in"}
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
