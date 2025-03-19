import { AsyncLocalStorage } from "node:async_hooks";
import { createRouter } from "./router.tsx";

export type RouteContextValue = { path: string };

// Same Context for RSC and SSR
// Uses `global` as RSC and SSR are bundled into separate files but execute in the same process
const routerStorage = (global[Symbol.for("parcel-rsc-router")] ||=
  new AsyncLocalStorage<RouteContextValue>());

/**
 * Get the current route from AsyncLocalStorage
 * @returns Current route path
 */
export function getRoute(): string {
  const store = routerStorage.getStore();
  return store?.path || "UNDEFINED";
}

/**
 * Create a router context for server-side rendering
 * @param path Initial route path
 * @param callback Function to execute within this context
 * @returns Result of the callback
 */
export function withRouterContext<T>(path: string, callback: () => T): T {
  return routerStorage.run({ path }, callback);
}

export const router = createRouter({
  // No-op for server compatibility with browser implementation
  onRouteChange: () => {
    return () => {};
  },
  // No-op for server compatibility with browser implementation
  onHistoryChange: () => {
    return () => {};
  },
  setRoute: () => {
    throw new Error(
      "setRoute cannot be called directly on the server. " +
        "Use withRouterContext to establish the route context instead.",
    );
  },
  getRoute,
});
