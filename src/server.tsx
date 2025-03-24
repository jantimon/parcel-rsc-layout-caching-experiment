import express from "express";
import React from "react";
import { MainLayout } from "./components/MainLayout";
import { createServerRoute } from "./router/createServerRoute";
import { LayoutRenderer } from "./router/LayoutRenderer";

const app = express();
const routHandler = createServerRoute(<LayoutRenderer layout={MainLayout} />);

app.use(express.static("dist"));
app.use(express.static("public"));

app.use(async (req, res) => {
  try {
    return routHandler(req, res);
  } catch (error) {
    console.error("Error rendering layout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001);
console.log("Server listening on port 3001");
