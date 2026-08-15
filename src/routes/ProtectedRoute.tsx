import { Navigate } from "react-router-dom";
import { useSession } from "../stores/session";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useSession();

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
