import type { RouteObject } from "react-router-dom";
import { Login } from "../pages/public/Login";

export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
];
