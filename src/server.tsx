import express from "express";
import { requestHandlers } from "./router/routes/ServerSideRoutes";

const app = express();

app.use(express.static("dist"));
app.use(express.static("public"));

app.use(async (req, res) => {
  try {
    const routeHandler = requestHandlers[req.path] || requestHandlers["/404"];
    return routeHandler(req, res);
  } catch (error) {
    console.error("Error rendering layout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001);
console.log("Server listening on port 3001");
