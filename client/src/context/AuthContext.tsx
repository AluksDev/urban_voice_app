import { createContext, useContext, useEffect, useState } from "react";

// Define the shape of your user
type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  photo_url: string;
} | null;

// Define the context type
type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  initializing: boolean;
  login: (userData: User) => void;
  logout: () => void;
  justLoggedOut: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [justLoggedOut, setJustLoggedOut] = useState<boolean>(false);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  // Login updates all auth state
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    setJustLoggedOut(false);
  };

  // Logout clears all auth state
  const logout = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      const body = await res.json();
      if (!body.success) {
        throw new Error(body.message);
      }
      setUser(null);
      setIsLoggedIn(false);
      setJustLoggedOut(true);
    } catch (e) {
      console.error("logout error:", e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function verifyOnStart() {
      try {
        // call server verify endpoint
        const res = await fetch(`${apiUrl}/auth/verify`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) {
            setUser(null);
            setIsLoggedIn(false);
            setJustLoggedOut(false);
          }
          return;
        }

        const body = await res.json();
        if (body && body.success && body.user) {
          if (!cancelled) {
            setUser(body.user);
            setIsLoggedIn(true);
          }
        } else {
          if (!cancelled) {
            setUser(null);
            setIsLoggedIn(false);
          }
        }
      } catch (e) {
        // network/server error — make sure we don't leave the app stuck; treat as logged out
        console.warn("verify-on-start failed:", e);
        try {
        } catch (er) {}
        if (!cancelled) {
          setUser(null);
          setIsLoggedIn(false);
        }
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
      value={{ user, isLoggedIn, initializing, login, logout, justLoggedOut }}
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
