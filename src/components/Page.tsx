"use client";

import React, { lazy, useSyncExternalStore } from "react";
import { router } from "../router";
import { PLACEHOLDER_TOKEN } from "../cache/token";

// Especially for Client Navigation the router would have to preload the lazy components
const LazyHome = lazy(() => import("../pages/Home"));
const LazyAbout = lazy(() => import("../pages/About"));

export function Page() {
  const path = useSyncExternalStore(...router.routerStore);
  if (path === "UNDEFINED") {
    return PLACEHOLDER_TOKEN;
  }

  if (!path) {
    return <div>Loading...</div>;
  } else if (path === "/") {
    return <LazyHome />;
  } else if (path === "/about") {
    return <LazyAbout />;
  }
  return <div>404 Not Found</div>;
}
