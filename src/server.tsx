import { getLayout } from "./cache/rscCache";
import { MainLayout } from "./components/MainLayout";
import { withRouterContext } from "./router/router.node";
import express from "express";
import React from "react";
import { renderHTML, renderRequest } from "@parcel/rsc/node";
import { Page } from "./components/Page";

const app = express();

const layout = <MainLayout />;

app.use(express.static("dist"));

app.use("*", async (req, res, next) => {
  if (req.path.endsWith("/") === false) {
    return next();
  }
  try {
    const { html } = await getLayout(layout, { component: MainLayout });
    res.setHeader("Content-Type", "text/html");
    res.write(html[0]);
    await withRouterContext(req.path, async () => {
      console.log("start router");
      res.write("<!-- START -->");

      // This is a hack around the fact that we can't user react-server dom to stream the Router
      // because of Error: react-dom/server is not supported in React Server Components
      const stream = await renderHTML(<Page />);
      for await (const chunk of stream) {
        const html = chunk.toString("utf-8");
        const indexOfLastScript = html.lastIndexOf("</script>");
        const htmlAfterLastScript =
          indexOfLastScript !== -1
            ? html.slice(indexOfLastScript + "</script>".length)
            : html;
        const htmlWithoutLinks = htmlAfterLastScript.replace(
          /<link[^>]+>/g,
          "",
        );
        res.write(htmlWithoutLinks);
        // That's a big hack:
        // Parcels first chunk includes the entire html
        // The other chunks are the rsc payload and </body></html>
        break;
      }
      res.write("<!-- END -->");
      res.write(html[1]);
      res.end();
    });
  } catch (error) {
    console.error("Error rendering layout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/layout", async (req, res) => {
  await renderRequest(req, res, <MainLayout />, { component: MainLayout });
});

app.listen(3001);
console.log("Server listening on port 3001");
