"use server-entry";
import React from "react";
import { Page } from "../routes/ClientSideRouter";
import "./hydrate";
import { ClientLayoutRouter } from "./ClientLayoutRouter";

/**
 * Render the Router Entry inside the given Layout and hydrate it
 */
export const LayoutRenderer = ({
  layout: Layout,
}: {
  layout?: React.FunctionComponent<{ children: React.ReactNode }>;
  layoutName?: string;
}) => (
  <ClientLayoutRouter>
    {Layout ? (
      <Layout>
        <Page />
      </Layout>
    ) : (
      <Page />
    )}
  </ClientLayoutRouter>
);
