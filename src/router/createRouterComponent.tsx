"use client";
import React, { lazy, use, useId, useSyncExternalStore } from "react";
import { router } from "../router";
import { PLACEHOLDER_TOKEN } from "../cache/token";

export function createRouterComponent(
  id: string,
  routes: Record<
    string,
    () => Promise<{
      default: React.ComponentType<any>;
      getInitialProps?: () => Promise<Record<string, unknown>>;
    }>
  >,
) {
  id = `__initial__${id}__`;

  const routeComponents = Object.fromEntries(
    Object.entries(routes).map(([path, loader]) => {
      const LazyComponent = lazy(loader);
      return [path, LazyComponent] as const;
    }),
  );

  let pageProps: WeakMap<any, Promise<Record<string, unknown>>> | null = null;

  return function Page() {
    const path = useSyncExternalStore(...router.routerStore);
    // During the layout caching the path is not set
    if (path === "UNDEFINED") {
      return PLACEHOLDER_TOKEN;
    }
    const Route = (routeComponents[path] ||
      routeComponents["/404"]) as unknown as React.ComponentType;
    debugger;
    let initialPropsMaps = pageProps;

    // Initial props is not set initially
    // This allows detecting if the component can consume the initial props
    // from the server
    if (!initialPropsMaps) {
      initialPropsMaps = new WeakMap();
      if (typeof window !== "undefined") {
        const readFromDom = document.getElementById(id);
        if (readFromDom) {
          initialPropsMaps.set(
            Route,
            Promise.resolve(
              (JSON.parse(readFromDom.innerHTML || "{}") as Record<
                string,
                unknown
              >) || {},
            ),
          );
        }
        pageProps = initialPropsMaps;
      }
    }
    let initalPropsPromise = initialPropsMaps.get(Route);
    if (!initalPropsPromise) {
      // Clear previous props to refresh the cache on route change
      initialPropsMaps = new WeakMap();
      initalPropsPromise = routes[path]().then(
        (module) => module.getInitialProps?.() || {},
      ) as Promise<Record<string, unknown>>;
      // Keep promise stable during client side navigation
      if (typeof window !== "undefined") {
        initialPropsMaps.set(Route, initalPropsPromise);
        pageProps = initialPropsMaps;
      }
    }

    const initialProps = use(initalPropsPromise);

    return (
      <>
        <Route {...initialProps} />
        {/* This script tag is used to pass initial props to the client-side component. */}
        <script
          id={id}
          type="json/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              typeof window === "undefined" ? JSON.stringify(initialProps) : "",
          }}
        />
      </>
    );
  };
}
