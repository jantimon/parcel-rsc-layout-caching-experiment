"use server-entry";
import React from "react";
import "./fancy.css";

export function FancyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>RSC Layout Caching Experiment</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap"
        />
      </head>
      <body>
        <header>
          <h1>✨ RSC Layout Caching Demo ✨</h1>
          <div className="timestamp">
            Cached at: {new Date().toLocaleTimeString()} on{" "}
            {new Date().toLocaleDateString()}
          </div>
        </header>

        <main>{children}</main>

        <footer>
          <p>🚀 Powered by React Server Components & Parcel 📦</p>
        </footer>
      </body>
    </html>
  );
}
