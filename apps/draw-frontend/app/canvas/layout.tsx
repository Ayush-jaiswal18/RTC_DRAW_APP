import HideNavbarClient from "./HideNavbarClient";

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  // Canvas pages should render full-bleed without the global navbar.
  // Provide a small floating back control so users can return to the app.
  return (
    <>
      <HideNavbarClient />

      <div className="fixed left-4 top-4 z-50">
        <a
          href="/"
          aria-label="Back to home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-100 hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
      </div>

      {children}
    </>
  );
}
