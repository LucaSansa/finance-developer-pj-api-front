import type { RouteObject } from "react-router-dom"
import { Signin } from "../pages/public/Signin"
import { Signup } from "../pages/public/Signup"
import { ConfirmEmail } from "../pages/public/ConfirmEmail"
import { VerifyEmail } from "../pages/public/VerifyEmail"
import { ForgotPassword } from "../pages/public/ForgotPassword"
import { ResetPassword } from "../pages/public/ResetPassword"

export const publicRoutes: RouteObject[] = [
  {
    path: "/signin",
    element: <Signin />,
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
  {
    path: "/resend-forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]
