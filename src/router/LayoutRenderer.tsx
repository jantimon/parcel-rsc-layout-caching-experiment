"use server-entry";
import React, { Suspense } from "react";
import { Page } from "../components/Page";
import "./client";

/**
 * Render the Router Entry inside the given Layout and hydrate it.
 */
export const LayoutRenderer = ({
  layout: Layout,
}: {
  layout?: React.FunctionComponent<{ children: React.ReactNode }>;
}) =>
  Layout ? (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Page />
      </Suspense>
    </Layout>
  ) : (
    <Page />
  );
