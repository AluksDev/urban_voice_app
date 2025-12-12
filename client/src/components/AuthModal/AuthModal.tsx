import React, { useEffect, useState } from "react";
import "./AuthModal.css";
import Toaster from "../Toaster/Toaster";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

type AuthModalProps = {
  onLogInSuccessful: (message: string) => void;
  closeModal: () => void;
};

const AuthModal = ({ onLogInSuccessful, closeModal }: AuthModalProps) => {
  const { t } = useTranslation();
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
  const [rightClass, setRightClass] = useState<boolean>(false);
  const apiUrl: string = import.meta.env.VITE_API_URL;
  const auth = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = signupName.trim();
    const trimmedSurname = signupSurname.trim();
    const trimmedEmail = signupEmail.trim();
    const trimmedPassword = signupPassword.trim();
    const trimmedPasswordRep = signupPasswordRep.trim();

    // Frontend validation using i18n
    if (trimmedName.length < 1) {
      setToasterMessage(t("authModal.messages.nameTooShort"));
      setToasterType("error");
      return;
    }

    if (trimmedSurname.length < 1) {
      setToasterMessage(t("authModal.messages.surnameTooShort"));
      setToasterType("error");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setToasterMessage(t("authModal.messages.invalidEmail"));
      setToasterType("error");
      return;
    }

    if (trimmedPassword.length < 8) {
      setToasterMessage(t("authModal.messages.invalidPassword"));
      setToasterType("error");
      return;
    }

    if (trimmedPassword !== trimmedPasswordRep) {
      setToasterMessage(t("authModal.messages.passwordsDontMatch"));
      setToasterType("error");
      return;
    }

    const data = {
      name: trimmedName,
      surname: trimmedSurname,
      email: trimmedEmail,
      password: trimmedPassword,
    };

    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) {
        const backendMsg =
          t(`authModal.backend.${result.code}`) ||
          t("authModal.messages.signupError");
        setToasterMessage(backendMsg);
        setToasterType("error");
      } else {
        if (result.user) auth.login(result.user);
        onLogInSuccessful(t("authModal.messages.signupSuccess"));
      }

      setSignupName("");
      setSignupSurname("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupPasswordRep("");
    } catch (err) {
      console.error("Signup error:", err);
      setToasterMessage(t("authModal.messages.signupError"));
      setToasterType("error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedEmail.includes("@")) {
      setToasterMessage(t("authModal.messages.invalidEmail"));
      setToasterType("error");
      return;
    }

    if (trimmedPassword.length < 8) {
      setToasterMessage(t("authModal.messages.invalidPassword"));
      setToasterType("error");
      return;
    }

    const loginData = { email: trimmedEmail, password: trimmedPassword };

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) {
        const backendMsg =
          t(`authModal.backend.${result.code}`) ||
          t("authModal.messages.loginError");
        setToasterMessage(backendMsg);
        setToasterType("error");
      } else {
        auth.login(result.user);
        onLogInSuccessful(t("authModal.messages.loginSuccess"));
      }

      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setToasterMessage(t("authModal.messages.loginError"));
      setToasterType("error");
    }
  };

  const handleClassClick = () => setRightClass(!rightClass);

  useEffect(() => {
    if (!toasterMessage) return;

    const leaveTimer = setTimeout(() => setToasterLeaving(true), 3000);
    const removeTimer = setTimeout(() => {
      setToasterMessage("");
      setToasterLeaving(false);
    }, 3300);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toasterMessage]);

  return (
    <div className="modal-container" onClick={closeModal}>
      <div className="inner-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`overlay-container ${rightClass ? "right" : ""}`}>
          <div className={`overlay ${rightClass ? "right" : ""}`}>
            <div className="overlay-panel-left">
              <h3>{t("authModal.overlay.panelLeft.title", "Hello friend")}</h3>
              <h4>
                {t(
                  "authModal.overlay.panelLeft.subtitle",
                  "Enter your personal details and start journey with us"
                )}
              </h4>
              <p>
                {t(
                  "authModal.overlay.panelLeft.prompt",
                  "Do you already have an account?"
                )}
              </p>
              <button onClick={handleClassClick}>
                {t("authModal.overlay.panelLeft.button", "Log In")}
              </button>
            </div>
            <div className="overlay-panel-right">
              <h3>
                {t("authModal.overlay.panelRight.title", "Welcome Back!")}
              </h3>
              <h4>
                {t(
                  "authModal.overlay.panelRight.subtitle",
                  "To keep connected with us please login with your personal info"
                )}
              </h4>
              <p>
                {t(
                  "authModal.overlay.panelRight.prompt",
                  "Don't have an account?"
                )}
              </p>
              <button onClick={handleClassClick}>
                {t("authModal.overlay.panelRight.button", "Sign Up")}
              </button>
            </div>
          </div>
        </div>
        {toasterMessage && (
          <Toaster
            message={toasterMessage}
            type={toasterType}
            isLeaving={toasterLeaving}
          />
        )}
        <div className="close-icon-container-right" onClick={closeModal}>
          <img
            src="/images/close-icon.svg"
            alt={t("authModal.closeAlt", "close icon")}
          />
        </div>
        <div className="close-icon-container-left" onClick={closeModal}>
          <img
            src="/images/close-icon.svg"
            alt={t("authModal.closeAlt", "close icon")}
          />
        </div>

        <div className="login-container">
          <h2>{t("authModal.login.title", "Log In")}</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder={t("authModal.login.emailPlaceholder", "Email")}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t("authModal.login.passwordPlaceholder", "Password")}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              minLength={8}
              required
            />
            <button type="submit">
              {t("authModal.login.button", "Log In")}
            </button>
          </form>
        </div>

        <div className="signup-container">
          <h2>{t("authModal.signup.title", "Sign Up")}</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder={t("authModal.signup.namePlaceholder", "Name")}
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              minLength={1}
              required
            />
            <input
              type="text"
              placeholder={t(
                "authModal.signup.surnamePlaceholder",
                "Surname(s)"
              )}
              value={signupSurname}
              onChange={(e) => setSignupSurname(e.target.value)}
              minLength={1}
              required
            />
            <input
              type="email"
              placeholder={t("authModal.signup.emailPlaceholder", "Email")}
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t(
                "authModal.signup.passwordPlaceholder",
                "Password"
              )}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder={t(
                "authModal.signup.repeatPasswordPlaceholder",
                "Repeat Password"
              )}
              value={signupPasswordRep}
              onChange={(e) => setSignupPasswordRep(e.target.value)}
              minLength={8}
              required
            />
            <button type="submit">
              {t("authModal.signup.button", "Sign Up")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
