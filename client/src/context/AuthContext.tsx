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
  isLoggedIn: boolean;
  initializing: boolean;
  login: (userData: User) => void;
  logout: () => void;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  // Login updates all auth state
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Logout clears all auth state
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
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
          if (!cancelled) logout();
          return;
        }

        const body = await res.json();
        if (body && body.success && body.user) {
          if (!cancelled) {
            setUser(body.user);
            setIsLoggedIn(true);
          }
        } else {
          if (!cancelled) logout();
        }
      } catch (e) {
        // network/server error — make sure we don't leave the app stuck; treat as logged out
        console.warn("verify-on-start failed:", e);
        try {
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
      value={{ user, isLoggedIn, initializing, login, logout }}
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
