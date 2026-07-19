"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Pencil, Sparkles } from "lucide-react";

export default function NavbarClient({ initialIsAuthenticated = false }: { initialIsAuthenticated?: boolean }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

  useEffect(() => {
    const syncAuthState = () => {
      const storedValue = window.localStorage.getItem("isAuthenticated");
      setIsAuthenticated(initialIsAuthenticated || storedValue === "true");
    };

    syncAuthState();
    window.addEventListener("auth:change", syncAuthState);

    return () => window.removeEventListener("auth:change", syncAuthState);
  }, [initialIsAuthenticated]);

  async function handleLogout() {
    try {
      await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network issues and still clear client state.
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("isAuthenticated");
      window.dispatchEvent(new Event("auth:change"));
    }

    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="relative">
        <Link
          href="/"
          className="absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-3 rounded-full px-2 py-1 text-slate-900 transition hover:bg-slate-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-sm">
            <Pencil className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">Draw RTC</span>
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
              collaborative canvas
            </span>
          </span>
        </Link>

        <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-6">
          <div className="flex h-14 items-center justify-end">
            <nav className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-red-200 px-4 text-red-600 shadow-sm transition hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200 px-4 shadow-sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="h-9 rounded-full bg-indigo-600 px-4 shadow-sm hover:bg-indigo-700">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
