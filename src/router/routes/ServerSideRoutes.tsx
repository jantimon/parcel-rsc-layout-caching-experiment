// This file should probably be generated

import { MainLayout } from "../../components/MainLayout";
import { FancyLayout } from "../../components/FancyLayout";
import { createServerRoute } from "../rsc/createServerRoute";

export const layouts = {
  MainLayout: createServerRoute(MainLayout),
  FancyLayout: createServerRoute(FancyLayout),
};
