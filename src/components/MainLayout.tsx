"use server-entry";
import React from "react";
import "./main.css";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="main-layout">
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

        <main>{children}</main>

        <footer>
          <p>Powered by React Server Components & Parcel</p>
        </footer>
      </body>
    </html>
  );
}
