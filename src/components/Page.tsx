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

const extractInitalProps = () => {
  const scriptTag = document.getElementById("initialProps");
  if (!scriptTag) {
    return {};
  }
  const initialProps = JSON.parse(scriptTag.textContent || "{}") || {};
  return initialProps;
};

let currentUrlInitialProps: [string, Promise<Record<string, unknown>>] =
  typeof window === "undefined"
    ? ["", Promise.resolve()]
    : [router.routerStore[1](), Promise.resolve(extractInitalProps())];

export function Page() {
  const path = useSyncExternalStore(...router.routerStore);
  if (path === "UNDEFINED") {
    return PLACEHOLDER_TOKEN;
  }
  const loader = routes[path];
  let initialProps: {} = {};
  if (currentUrlInitialProps[0] !== path) {
    const propsLoader = loader().then(
      (module) => module.getInitialProps?.() || {},
    );
    if (typeof window !== "undefined") {
      // This is a workaround for the fact that React doesn't
      // support async components yet
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
