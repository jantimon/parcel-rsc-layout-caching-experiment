"use client";
import React, { lazy, use, useSyncExternalStore } from "react";
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

let currentUrlInitialProps: [string, Promise<Record<string, unknown>>] =
  typeof window === "undefined"
    ? ["", Promise.resolve()]
    : // On first hydration extract the inial props
      [
        router.routerStore[1](),
        Promise.resolve(
          JSON.parse(
            document.getElementById("initialProps")?.textContent || "{}",
          ) || {},
        ),
      ];

export function Page() {
  const path = useSyncExternalStore(...router.routerStore);
  // During the layout caching the path is not set
  if (path === "UNDEFINED") {
    return PLACEHOLDER_TOKEN;
  }
  const loader = routes[path];
  let initialProps: {} = {};
  if (currentUrlInitialProps[0] !== path) {
    const propsLoader = loader().then(
      (module) => module.getInitialProps?.() || {},
    );
    // On the server react will wait for the promise
    // on the client it will rerender and therefore
    // we need to ensure that the promise is stable
    // and not recreated on every render
    if (typeof window !== "undefined") {
      currentUrlInitialProps = [path, propsLoader];
    }
    initialProps = use(propsLoader);
  } else {
    initialProps = use(currentUrlInitialProps[1]);
  }
  const Route = (routeComponents[path] ||
    routeComponents["/404"]) as unknown as React.ComponentType;
  return (
    <>
      <Route {...initialProps} />
      {/* This script tag is used to pass initial props to the client-side component. */}
      <script
        id="initialProps"
        type="json/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html:
            typeof window === "undefined" ? JSON.stringify(initialProps) : "",
        }}
      />
    </>
  );
}
