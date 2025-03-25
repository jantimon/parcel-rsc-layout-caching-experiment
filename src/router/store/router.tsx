import React from "react";

export type RouterImplementation = {
  onRouteChange: (listener: () => void) => () => void;
  onHistoryChange: (listener: () => void) => () => void;
  setRoute: (path: string, replace?: boolean) => void;
  getRoute: () => string;
};

export function createRouter(implementation: RouterImplementation) {
  return {
    // Public API
    navigate: (path: string, options?: { replace?: boolean }) => {
      implementation.setRoute(path, options?.replace);
    },

    // For useSyncExternalStore
    routerStore: [
      // On Route Change
      (callback) => {
        const unsubscribeRoute = implementation.onRouteChange(callback);
        const unsubscribeHistory = implementation.onHistoryChange(callback);
        return () => {
          unsubscribeRoute();
          unsubscribeHistory();
        };
      },
      // CSR
      implementation.getRoute,
      // SSR
      implementation.getRoute,
    ] as const satisfies Parameters<
      typeof import("react").useSyncExternalStore
    >,

    useOnRouteChange: (callback: (route: string) => void) => {
      const latestCallback = React.useRef(callback);
      latestCallback.current = callback;
      React.useEffect(
        () =>
          implementation.onRouteChange(() =>
            latestCallback.current(implementation.getRoute()),
          ),
        [],
      );
    },

    // Components
    Link: ({ href, children, ...props }) => {
      const handleClick = (e) => {
        e.preventDefault();
        implementation.setRoute(href);
      };

      return (
        <a href={href} onClick={handleClick} {...props}>
          {children}
        </a>
      );
    },
  };
}
