"use client";

import { useEffect } from "react";

export default function HideNavbarClient() {
  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, []);

  return null;
}
