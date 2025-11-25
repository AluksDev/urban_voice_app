import React, { useEffect, useState } from "react";
import "./AuthModal.css";
import Toaster from "../Toaster/Toaster";
import { useAuth } from "../../context/AuthContext";

type AuthModalProps = {
  onLogInSuccessful: () => void;
};

const AuthModal = ({ onLogInSuccessful }: AuthModalProps) => {
  const [signupName, setSignupName] = useState<string>("");
  const [signupSurname, setSignupSurname] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupPasswordRep, setSignupPasswordRep] = useState<string>("");
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const auth = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim inputs
    const trimmedSignupName = signupName.trim();
    const trimmedSignupSurname = signupSurname.trim();
    const trimmedSignupEmail = signupEmail.trim();
    const trimmedSignupPassword = signupPassword.trim();
    const trimmedSignupPasswordRep = signupPasswordRep.trim();

    // Validation
    if (trimmedSignupName.length < 2) {
      setToasterMessage("Name must be at least 2 characters");
      setToasterType("error");
      return;
    }

    if (trimmedSignupSurname.length < 2) {
      setToasterMessage("Surname must be at least 2 characters");
      setToasterType("error");
      return;
    }

    if (
      !trimmedSignupEmail.includes("@") ||
      !trimmedSignupEmail.includes(".")
    ) {
      setToasterMessage("Please enter a valid email address");
      setToasterType("error");
      return;
    }

    if (trimmedSignupPassword.length < 8) {
      setToasterMessage("Password must be at least 8 characters");
      setToasterType("error");
      return;
    }

    if (trimmedSignupPassword !== trimmedSignupPasswordRep) {
      setToasterMessage("Passwords do not match");
      setToasterType("error");
      return;
    }

    // Prepare data to send
    const data = {
      name: trimmedSignupName,
      surname: trimmedSignupSurname,
      email: trimmedSignupEmail,
      password: trimmedSignupPassword,
    };

    try {
      const res = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success == false) {
        setToasterMessage(result.message);
        setToasterType("error");
      }

      // Reset form
      setSignupName("");
      setSignupSurname("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupPasswordRep("");
    } catch (err) {
      console.log("Error signing up: ", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLoginEmail = loginEmail.trim();
    const trimmedLoginPsw = loginPassword.trim();

    if (!trimmedLoginEmail.includes("@")) {
      setToasterMessage("Please enter a valid email");
      setToasterType("error");
      return;
    }

    if (trimmedLoginPsw.length < 8) {
      setToasterMessage("Password must be at least 8 characters");
      setToasterType("error");
      return;
    }

    // Prepare data to send
    const loginData = {
      email: trimmedLoginEmail,
      password: trimmedLoginPsw,
    };

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await res.json();
      if (result.success == false) {
        setToasterMessage(result.message);
        setToasterType("error");
      } else {
        onLogInSuccessful();
        auth.login(result.user, result.token);
      }
      // Reset form
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      console.log("Error loggin in: ", err);
    }
  };

  useEffect(() => {
    if (toasterMessage === "") return;

    const leaveTimer = setTimeout(() => {
      setToasterLeaving(true);
    }, 3000); // toast visible for 3s

    const removeTimer = setTimeout(() => {
      setToasterMessage("");
      setToasterLeaving(false); // reset for next toast
    }, 3300); // 3000 + 300ms animation

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toasterMessage]);

  return (
    <div className="modal-container">
      <div className="inner-modal">
        {toasterMessage != "" && (
          <Toaster
            message={toasterMessage}
            type={toasterType}
            isLeaving={toasterLeaving}
          />
        )}

        <div className="login-container">
          <h2>Log In</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              minLength={8}
              required
            />

            <button type="submit">Log In</button>
          </form>
        </div>
        <div className="signup-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              minLength={2}
              required
            />
            <input
              type="text"
              placeholder="Surname(s)"
              value={signupSurname}
              onChange={(e) => setSignupSurname(e.target.value)}
              minLength={2}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder="Repeat Password"
              value={signupPasswordRep}
              onChange={(e) => setSignupPasswordRep(e.target.value)}
              minLength={8}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
