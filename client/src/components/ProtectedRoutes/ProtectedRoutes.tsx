import React, { type ReactNode, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

type ProtectedRoutesPrompt = {
  children: ReactNode;
  // called when a protected route is accessed but the user is not authenticated
  onAuthRequired?: () => void;
};

const ProtectedRoutes = ({
  children,
  onAuthRequired,
}: ProtectedRoutesPrompt) => {
  const auth = useAuth();
  // While the provider verifies a stored token, don't redirect; wait for verification
  if (auth.initializing) {
    return <div style={{ padding: 20 }}>Checking authentication…</div>;
  }

  if (!auth.isLoggedIn) {
    // Inform the caller once that auth is required (used to trigger a toast)
    const opened = useRef(false);
    if (!opened.current) {
      if (onAuthRequired) onAuthRequired();
      opened.current = true;
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
