import type { RouteObject } from "react-router-dom"
import { Login } from "../pages/public/Login"
import { Signup } from "../pages/public/signup"
import { ConfirmEmail } from "../pages/public/ConfirmEmail"
import { VerifyEmail } from "../pages/public/VerifyEmail"

export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/confirmar-email",
    element: <ConfirmEmail />,
  },
]
