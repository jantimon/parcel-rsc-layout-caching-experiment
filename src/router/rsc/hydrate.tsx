"use client-entry";
import { hydrate } from "@parcel/rsc/client";

// During SSR, the server preloads the javascript modules
// Remove them to prevent hydration errors
document.querySelectorAll("body link[rel=modulepreload]").forEach((link) => {
  link.remove();
});

hydrate();
