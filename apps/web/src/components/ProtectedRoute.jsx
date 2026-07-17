import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) return null; // atau spinner
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasRole(...allowedRoles)) return <Navigate to="/login" replace />;

  return <Outlet />;
}