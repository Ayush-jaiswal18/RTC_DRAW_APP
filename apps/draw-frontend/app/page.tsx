import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Pencil, Share2, Users2, Sparkles, Download } from "lucide-react";

export default async function App() {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("token");

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className="text-primary block">Made Simple</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create, collaborate, and share beautiful diagrams and sketches with our intuitive drawing tool.
              No sign-up required.
            </p>

            {!isAuthenticated && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signin">
                  <Button size="lg" className="h-12 px-6 flex">
                    Sign in
                    <Pencil className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Collaboration</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Work together with your team in real-time.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Multiplayer Editing</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Multiple users can edit the same canvas simultaneously.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Drawing</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Intelligent shape recognition and drawing assistance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 sm:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to start creating?
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
                Join thousands of users who are already creating amazing diagrams.
              </p>

              {isAuthenticated && (
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/create-room">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-6 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    >
                      Open Canvas
                    </Button>
                  </Link>

                  <form action="http://localhost:3001/logout" method="POST">
                    <Button className="hover:bg-red-600 hover:border-red-500 hover:text-black"
                      variant="outline"
                      size="lg"
                      type="submit"
                    >
                      Logout
                    </Button>
                  </form>

                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-medium">Draw RTC</span>.
              All rights reserved.
            </p>

            <a
              href="/download"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
