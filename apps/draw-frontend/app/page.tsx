import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Share2, Users2, Sparkles, Download, PenTool, MessageCircle, Layers3 } from "lucide-react";

const features = [
  {
    icon: Share2,
    title: "Live collaboration",
    description: "Sketch, discuss, and iterate together in real time with zero friction.",
  },
  {
    icon: Users2,
    title: "Shared rooms",
    description: "Invite teammates into a room and turn ideas into visual plans instantly.",
  },
  {
    icon: Layers3,
    title: "Flexible canvas",
    description: "Switch between shapes, notes, arrows, and freehand strokes effortlessly.",
  },
];

export default async function App() {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("token");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.15),_transparent_30%),linear-gradient(135deg,_#f8faff_0%,_#eef2ff_100%)]">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(129,140,248,0.3),_transparent_25%)]" />
        <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Designed for modern teams and creative minds
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Turn ideas into
                <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500 bg-clip-text text-transparent">
                  beautiful whiteboards
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:mx-0">
                Build diagrams, brainstorm flows, and collaborate in real time with a canvas that feels as smooth as your best ideas.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link href="/create-room">
                  <Button size="lg" className="h-12 px-6 bg-indigo-600 text-white hover:bg-indigo-700">
                    Start drawing
                    <PenTool className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/signin">
                    <Button variant="outline" size="lg" className="h-12 px-6 border-slate-300 bg-white/80 text-slate-700 hover:bg-white">
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-4 shadow-2xl shadow-indigo-100 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-500 to-sky-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">Live board preview</p>
                    <h2 className="mt-1 text-2xl font-semibold">Sprint planning board</h2>
                  </div>
                  <div className="rounded-full bg-white/20 p-2">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <div className="flex items-center gap-3 rounded-xl bg-white/20 p-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <p className="text-sm">Ava added a new workflow diagram</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/20 p-3">
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <p className="text-sm">Riley commented on the onboarding flow</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/20 p-3">
                    <div className="h-3 w-3 rounded-full bg-cyan-400" />
                    <p className="text-sm">You moved the launch checklist into review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">Why teams love it</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need for fast, visual thinking</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="rounded-[2rem] border border-indigo-100 bg-slate-900 p-8 text-white shadow-2xl shadow-indigo-200 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to bring your next idea to life?</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
                Open a canvas, invite collaborators, and turn your next brainstorm into something beautiful.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/create-room">
                  <Button size="lg" className="h-12 px-6 bg-white text-slate-900 hover:bg-slate-100">
                    Open Canvas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} <span className="font-semibold text-slate-900">Draw RTC</span>. All rights reserved.
            </p>
            <a href="/download" className="text-slate-500 transition-colors hover:text-indigo-600">
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
