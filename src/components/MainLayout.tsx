"use server-entry";

import React from "react";
import { Page } from "./Page";
import "./client";

export function MainLayout() {
  return (
    <html>
      <head>
        <title>RSC Layout Caching Experiment</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <header>
          <h1>RSC Layout Caching Demo</h1>
          Cached at: {new Date().toString()}
        </header>

        <main>
          <Page />
        </main>

        <footer>
          <p>Powered by React Server Components & Parcel</p>
        </footer>
      </body>
    </html>
  );
}
