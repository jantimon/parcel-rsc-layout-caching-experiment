"use server-entry";
import React from "react";
import { Page } from "../routes/ClientSideRouter";
import "./hydrate";

/**
 * Render the Router Entry inside the given Layout and hydrate it
 */
export const LayoutRenderer = ({
  layout: Layout,
}: {
  layout?: React.FunctionComponent<{ children: React.ReactNode }>;
}) =>
  Layout ? (
    <Layout>
      <Page />
    </Layout>
  ) : (
    <Page />
  );
