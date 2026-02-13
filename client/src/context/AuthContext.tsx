import { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "../api";
import Toaster from "../components/Toaster/Toaster";

// Define the shape of your user
type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  photo_url: string;
  status: string;
} | null;

// Define the context type
type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  initializing: boolean;
  login: (userData: User) => void;
  logout: () => void;
  justLoggedOut: boolean;
  updateUser: (newUserData: Partial<User>) => void;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [justLoggedOut, setJustLoggedOut] = useState<boolean>(false);
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);

  // Login updates all auth state
  function login(userData: User) {
    if (userData?.status === "suspended") {
      setToasterMessage("Your account has been suspended.");
      setToasterType("error");
      setShowToaster(true);
      return;
    }
    setUser(userData);
    setIsLoggedIn(true);
    setJustLoggedOut(false);
  }

  // Logout clears all auth state
  async function logout() {
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
  }

  function updateUser(newUserData: Partial<User>) {
    setUser((prevUser) =>
      prevUser ? { ...prevUser, ...newUserData } : prevUser,
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function verifyOnStart() {
      try {
        // call server verify endpoint
        const res = await fetch(`${apiUrl}/auth/verify`, {
          method: "GET",
          credentials: "include",
        });
        const body = await res.json();

        if (!res.ok || !body.success) {
          if (!cancelled) {
            setUser(null);
            setIsLoggedIn(false);
            setJustLoggedOut(false);
            if (body.code) {
              setToasterMessage(body.code);
              setToasterType("error");
              setShowToaster(true);
            }
          }
          return;
        }

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
  useEffect(() => {
    if (showToaster) {
      setToasterLeaving(false); // ensure visible initially

      const leaveTimer = setTimeout(() => {
        setToasterLeaving(true); // start leaving animation
      }, 3000);

      const removeTimer = setTimeout(() => {
        setShowToaster(false); // hide completely
        setToasterLeaving(false); // reset for next toast
      }, 3300);

      return () => {
        clearTimeout(leaveTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showToaster]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        initializing,
        login,
        logout,
        justLoggedOut,
        updateUser,
      }}
    >
      {showToaster && (
        <Toaster
          message={toasterMessage}
          type={toasterType}
          isLeaving={toasterLeaving}
        />
      )}
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
