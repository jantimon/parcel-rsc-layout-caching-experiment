"use client";
// This should probably be generated

import { createRouterComponent } from "../createRouterComponent";
import { routeLayoutMapping } from "./LayoutRouter";

export const Page = createRouterComponent("page", routeLayoutMapping, {
  "/": () => import("../../pages/Home"),
  "/about": () => import("../../pages/About"),
  "/404": () => import("../../pages/NotFound"),
});
