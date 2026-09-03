import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { Dashboard } from "../pages/private/Dashboard";
import { MonthlyClosing } from "../pages/private/MonthlyClosing";

export const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/fechamento-mensal",
    element: (
      <ProtectedRoute>
        <MonthlyClosing />
      </ProtectedRoute>
    ),
  },
  {
    path: "/fechamento-mensal/:id",
    element: (
      <ProtectedRoute>
        <MonthlyClosing />
      </ProtectedRoute>
    ),
  },
];
