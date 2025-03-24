import { MainLayout } from "../../components/MainLayout";
import { FancyLayout } from "../../components/FancyLayout";
import { createServerRoute } from "../rsc/createServerRoute";

const mainLayoutHandler = createServerRoute(MainLayout);
const fancyLayoutHandler = createServerRoute(FancyLayout);

export const requestHandlers = {
  "/": mainLayoutHandler,
  "/about": fancyLayoutHandler,
  "/404": mainLayoutHandler,
};
