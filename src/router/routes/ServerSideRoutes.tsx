import { MainLayout } from "../../components/MainLayout";
import { createServerRoute } from "../rsc/createServerRoute";
import React from "react";

const mainLayoutHandler = createServerRoute(MainLayout);

export const requestHandlers = {
  "/": mainLayoutHandler,
  "/about": mainLayoutHandler,
  "/404": mainLayoutHandler,
};
