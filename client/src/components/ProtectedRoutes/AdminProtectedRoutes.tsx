import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
