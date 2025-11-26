import { createContext, useContext, useEffect, useState } from "react";

// Define the shape of your user
type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  picture_url: string;
} | null;

// Define the context type
type AuthContextType = {
  user: User;
  token: string | null;
  isLoggedIn: boolean;
  initializing: boolean; // true while the provider verifies any stored token
  login: (userData: User, token: string) => void;
  logout: () => void;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // token verification happens on mount; we expose an "initializing" flag so consumers can wait
  const [initializing, setInitializing] = useState(true);

  // Login updates all auth state
  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    setIsLoggedIn(true);
    try {
      // store token only — user is stored in memory and obtained from server on verify
      localStorage.setItem("auth_token", token);
    } catch (e) {
      console.warn("Could not persist auth to localStorage", e);
    }
  };

  // Logout clears all auth state
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    try {
      localStorage.removeItem("auth_token");
    } catch (e) {
      // ignore
    }
  };

  // On mount, if there is a token in localStorage ask the server to verify it.
  useEffect(() => {
    let cancelled = false;

    async function verifyOnStart() {
      try {
        const storedToken = localStorage.getItem("auth_token");
        if (!storedToken) {
          // no token — nothing to verify
          if (!cancelled) setInitializing(false);
          return;
        }

        // call server verify endpoint
        const res = await fetch("http://localhost:3001/auth/verify", {
          method: "GET",
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) {
          // token invalid or expired — clear stored token
          localStorage.removeItem("auth_token");
          if (!cancelled) logout();
          return;
        }

        const body = await res.json();
        if (body && body.success && body.user) {
          if (!cancelled) {
            setUser(body.user);
            setToken(storedToken);
            setIsLoggedIn(true);
          }
        } else {
          // not valid – clear stored token
          localStorage.removeItem("auth_token");
          if (!cancelled) logout();
        }
      } catch (e) {
        // network/server error — make sure we don't leave the app stuck; treat as logged out
        console.warn("verify-on-start failed:", e);
        try {
          localStorage.removeItem("auth_token");
        } catch (er) {}
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    verifyOnStart();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn, initializing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
