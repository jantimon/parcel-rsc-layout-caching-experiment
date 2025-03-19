import { renderRequest } from "@parcel/rsc/node";
import express from "express";
import React from "react";
import { renderToReadableStream } from "react-dom/server.edge" with { env: "react-client" };
import { getLayout } from "./cache/rscCache";
import { MainLayout } from "./components/MainLayout";
import { Page } from "./components/Page" with { env: "react-client" };
import { withRouterContext } from "./router/router.node";

const app = express();

const layout = <MainLayout />;

app.use(express.static("dist"));
app.use(express.static("public"));

app.use(async (req, res) => {
  try {
    // Get the App Shell (the layout) from the cache
    const { html } = await getLayout(layout, { component: MainLayout });
    res.setHeader("Content-Type", "text/html");

    // Stream the opening tags of the HTML document right away
    res.write(html[0]);

    await withRouterContext(req.path, async () => {
      // The page is rendered dynamically on every request
      const stream = await renderToReadableStream(<Page />);
      for await (const chunk of stream) {
        res.write(chunk);
        break;
      }

      // write the closing tags of the HTML document
      res.write(html[1]);
      res.end();
    });
  } catch (error) {
    console.error("Error rendering layout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001);
console.log("Server listening on port 3001");
