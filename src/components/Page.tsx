"use client";
import { createRouterComponent } from "../router/createRouterComponent";

export const Page = createRouterComponent("page", {
  "/": () => import("../pages/Home"),
  "/about": () => import("../pages/About"),
  "/404": () => import("../pages/NotFound"),
});
