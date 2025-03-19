"use client";

import React, { lazy, useSyncExternalStore } from "react";
import { router } from "../router";
import { PLACEHOLDER_TOKEN } from "../cache/token";

export const routes = {
  "/": () => import("../pages/Home"),
  "/about": () => import("../pages/About"),
  "/404": () => import("../pages/NotFound"),
} as const;

const routeComponents = Object.fromEntries(
  Object.entries(routes).map(([path, loader]) => {
    const LazyComponent = lazy(loader);
    return [path, LazyComponent] as const;
  }),
);

export function Page() {
  const path = useSyncExternalStore(...router.routerStore);
  if (path === "UNDEFINED") {
    return PLACEHOLDER_TOKEN;
  }
  const Route = routeComponents[path] || routeComponents["/404"];
  return <Route />;
}
