import { createRouter } from "./router.tsx";

/**
 * Get the current route from browser location
 * @returns Current route path
 */
export function getRoute(): string {
  return window.location.pathname;
}

/**
 * Set the current route using browser history API
 * @param path New route path
 * @param replace Whether to replace current history entry instead of pushing new one
 */
export function setRoute(path: string, replace: boolean = false): void {
  if (replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }

  // Manually trigger route change listeners
  window.dispatchEvent(new Event("routechange"));
}

/**
 * Subscribe to route changes (programmatic)
 * @param listener Function to call when route changes
 * @returns Unsubscribe function
 */
export function onRouteChange(listener: () => void) {
  window.addEventListener("routechange", listener);
  return () => {
    window.removeEventListener("routechange", listener);
  };
}

/**
 * Subscribe to history changes (back/forward buttons)
 * @param listener Function to call when history changes
 * @returns Unsubscribe function
 */
export function onHistoryChange(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener("popstate", listener);
  };
}

export const router = createRouter({
  onRouteChange,
  onHistoryChange,
  setRoute,
  getRoute,
});
