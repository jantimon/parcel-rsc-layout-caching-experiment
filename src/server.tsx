import express from "express";
import { layouts } from "./router/routes/ServerSideRoutes";
import { routeLayoutMapping } from "./router/routes/LayoutRouter";

const app = express();

app.use(express.static("dist"));
app.use(express.static("public"));

app.use("/layouts", async (req, res) => {
  const layoutName = req.path.match(/^\/([a-z0-9_]+)/i)?.[1];
  const layout = layoutName && layouts[layoutName as keyof typeof layouts];
  if (!layout) {
    res.status(404).send("Layout not found");
    return;
  }
  res.send(await layout.layout());
});

app.use(async (req, res) => {
  try {
    const layoutName =
      routeLayoutMapping[req.path as keyof typeof routeLayoutMapping];
    const routeHandler =
      layoutName && layouts[layoutName as keyof typeof layouts]?.handler;
    if (!routeHandler) {
      res.status(404);
      return layouts["/404"].handler(req, res);
    }
    return routeHandler(req, res);
  } catch (error) {
    console.error("Error rendering layout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001);
console.log("Server listening on port 3001");
