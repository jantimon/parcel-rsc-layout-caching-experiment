import React from "react";
import { renderToReadableStream } from "react-dom/server.edge" with { env: "react-client" };
import { getLayout } from "./cache/rscCache";
import { withRouterContext } from "./router.node";
import { LayoutRenderer } from "./LayoutRenderer";
import { Page } from "../components/Page" with { env: "react-client" };

interface Request {
  path: string;
}

interface Response {
  setHeader: (name: string, value: string) => void;
  write: (chunk: string | Buffer) => void;
  end: () => void;
  status: (code: number) => { send: (message: string) => void };
}

/**
 * Create a server route that uses a cached layout and a dynamic page component
 *
 * The layout is rendered once and cached, while the page component is rendered dynamically on each request
 */
export function createServerRoute(pageWithLayout: React.JSX.Element) {
  return async (req: Request, res: Response) => {
    // Get the App Shell (the layout) from the cache
    const { html } = await getLayout(pageWithLayout, {
      component: LayoutRenderer,
    });
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
  };
}
