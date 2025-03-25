"use client";
import React, { useContext, useState } from "react";

const LayoutClientContext = React.createContext<
  (layout: Promise<unknown>) => void
>(() => {
  throw new Error("LayoutClientContext not initialized");
});

export const useSetLayout = () => useContext(LayoutClientContext);

export const ClientLayoutRouter = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [layout, setLayout] = useState<Promise<unknown> | null>(null);
  return (
    <LayoutClientContext.Provider value={setLayout}>
      {layout ? (
        <>
          {
            /* Parcel RSC api issue - fetchRSC returns Promise<unknown> */
            layout as any
          }
        </>
      ) : (
        // If there is no client layout, we just return the children
        // to render the server layout
        <>{children}</>
      )}
    </LayoutClientContext.Provider>
  );
};
