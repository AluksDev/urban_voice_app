import { type ReactNode, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import AuthLoading from "../AuthLoading/AuthLoading";

type ProtectedRoutesPrompt = {
  children?: ReactNode; // optional, if you want to support direct children too
  onAuthRequired?: () => void;
};

const ProtectedRoutes = ({
  children,
  onAuthRequired,
}: ProtectedRoutesPrompt) => {
  const auth = useAuth();
  const opened = useRef(false);

  useEffect(() => {
    if (!auth.initializing && !auth.isLoggedIn) {
      if (!auth.justLoggedOut) {
        if (!opened.current) {
          if (onAuthRequired) onAuthRequired();
          opened.current = true;
        }
      }
    }

    // Reset when logged in again
    if (auth.isLoggedIn) {
      opened.current = false;
    }
  }, [auth.initializing, auth.isLoggedIn, onAuthRequired]);

  if (auth.initializing) {
    return <AuthLoading />;
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If nested routes exist, render Outlet, otherwise render children
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoutes;
