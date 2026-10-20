"use client";

import { useEffect } from "react";
import { clearAppBrowserPersistence } from "@/lib/browserPersistence";

export function BrowserCleanup() {
  useEffect(() => {
    void clearAppBrowserPersistence();
  }, []);

  return null;
}
