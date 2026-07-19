"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin, redirect }: { isSignin: boolean; redirect?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${HTTP_BACKEND}/${isSignin ? "signin" : "signup"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          name: email.split("@")[0],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("auth:change"));
      }

      router.refresh();
      router.push(redirect || "/");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)] px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-md border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {isSignin ? "Welcome back" : "Create your account"}
          </CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            {isSignin
              ? "Sign in to continue drawing and collaborating."
              : "Join the studio and start sharing ideas instantly."}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignin ? "Signing in..." : "Creating account..."}
                </span>
              ) : isSignin ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {isSignin ? "No account?" : "Already have an account?"}{" "}
            <Link
              href={isSignin ? "/signup" : "/signin"}
              className="font-medium text-indigo-600 transition hover:underline"
            >
              {isSignin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
