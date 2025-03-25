"use client";
import React, { lazy, use, useEffect, useSyncExternalStore } from "react";
import { router } from "../router/store";
import { PLACEHOLDER_TOKEN } from "./token";
import { fetchRSC } from "@parcel/rsc/client";
import { useSetLayout } from "./rsc/ClientLayoutRouter";
let isInitialRoute = true;
let currentLayout: Promise<unknown> | null = null;

/**
 * Create Client Component for the Browser and initial SSR
 *
 * This component is the magic hack which branches the code between
 *  - React Server Component (Layout generation)
 *  - Client (SSR)
 *  - Client (CSR)
 *
 * During the RSC Phase it will only render the PLACEHOLDER_TOKEN
 * as the layout will be cached and is not dyanmically rendered per request
 *
 * During the SSR Client Phase it will wait for the react.lazy component
 * and create the SSR HTML thanks to the React 18 lazy loading behavior
 *
 * During the CSR Client Phase it will wait for the lazy component and
 * fetch the layout from the server - once both are downloaded it will
 * render the route component
 */
export function createRouterComponent(
  id: string,
  routeLayoutMapping: Record<string, string>,
  routeClientComponentMapping: Record<
    string,
    // Client Component
    () => Promise<{
      default: React.ComponentType<any>;
      getInitialProps?: () => Promise<Record<string, unknown>>;
    }>
  >,
) {
  id = `__initial__${id}__`;

  const routeComponents = Object.fromEntries(
    Object.entries(routeClientComponentMapping).map(([path, jsLoader]) => {
      let stablePromise: Promise<{
        default: React.ComponentType<any>;
        getInitialProps?: () => Promise<Record<string, unknown>>;
      }> | null = null;
      /**
       * Load the client component javascript and rsc layout in parallel
       *
       * ensures that the promise is stable for client suspense
       */
      const routeLoader = (): Promise<{
        default: React.ComponentType<any>;
        getInitialProps?: () => Promise<Record<string, unknown>>;
      }> => {
        if (typeof window === "undefined") {
          return jsLoader();
        }
        if (!routeLayoutMapping[path]) {
          throw new Error("No layout for this route");
        }
        let loadLayoutPromise = loadLayoutOnce(routeLayoutMapping[path]);
        // On the first route we don't wait for the layout to be loaded
        // as it is already available in the html markup
        if (isInitialRoute) {
          isInitialRoute = false;
          currentLayout = loadLayoutPromise;
          return jsLoader();
        }
        // Prevent a different promise to be created on each render
        stablePromise ||= Promise.all([jsLoader(), loadLayoutPromise]).then(
          ([module]) => module,
        );
        return stablePromise;
      };
      // On the server the layout is already available but on client navigation we must load it
      // to be able to change the layout on client route change
      const LazyComponent = lazy(routeLoader);
      return [path, LazyComponent] as const;
    }),
  );

  let pageProps: WeakMap<any, Promise<Record<string, unknown>>> | null = null;

  return function Page() {
    const setLayout = useSetLayout();
    const path = useSyncExternalStore(...router.routerStore);
    // During the layout caching the path is not set
    if (path === "UNDEFINED") {
      return PLACEHOLDER_TOKEN;
    }
    const Route = (routeComponents[path] ||
      routeComponents["/404"]) as unknown as React.ComponentType;
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
      initalPropsPromise = (
        routeClientComponentMapping[path] || routeClientComponentMapping["/404"]
      )().then((module) => module.getInitialProps?.() || {}) as Promise<
        Record<string, unknown>
      >;
      // Keep promise stable during client side navigation
      if (typeof window !== "undefined") {
        initialPropsMaps.set(Route, initalPropsPromise);
        pageProps = initialPropsMaps;
      }
    }

    const initialProps = use(initalPropsPromise);

    const layoutRsc = browserLayoutCache.get(routeLayoutMapping[path]);
    // The initial route does not have a layout
    // as it is already rendered on the server
    useEffect(() => {
      // Only update the layout if the layout changed
      if (layoutRsc && currentLayout !== layoutRsc) {
        currentLayout = layoutRsc;
        setLayout(layoutRsc);
      }
    }, [layoutRsc]);

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

const browserLayoutCache = new Map<string, ReturnType<typeof fetchRSC>>();
function loadLayoutOnce(layoutName: string) {
  const cachedLayout = browserLayoutCache.get(layoutName);
  if (cachedLayout) {
    return cachedLayout;
  }
  const layout = fetchRSC(`/layouts/${layoutName}`);
  browserLayoutCache.set(layoutName, layout);
  return layout;
}
