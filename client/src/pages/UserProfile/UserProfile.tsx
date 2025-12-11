import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./UserProfile.css";

interface UserProfileProps {
  onLogOut: () => void;
  onPasswordChange: (message: string, type: string) => void;
  onUserChange: (message: string, type: string) => void;
}

const UserProfile = ({
  onLogOut,
  onPasswordChange,
  onUserChange,
}: UserProfileProps) => {
  const auth = useAuth();
  const [nameValue, setNameValue] = useState<string | undefined>(
    auth.user?.name
  );
  const [surnameValue, setSurnameValue] = useState<string | undefined>(
    auth.user?.surname
  );
  const [emailValue, setEmailValue] = useState<string | undefined>(
    auth.user?.email
  );
  const [oldPswValue, setOldPswValue] = useState<string>("");
  const [newPswValue, setNewPswValue] = useState<string>("");
  const [isPersonalInfo, setIsPersonalInfo] = useState<boolean>(true);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);

  const apiUrl: string = import.meta.env.VITE_API_URL;

  const spansRef = useRef<NodeListOf<HTMLSpanElement> | null>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  const changeView = (event: React.MouseEvent<HTMLSpanElement>) => {
    spansRef.current?.forEach((element) => {
      element.classList.remove("active");
    });
    switch (event.currentTarget.id) {
      case "personaInfo":
        setIsPersonalInfo(true);
        setIsChangePassword(false);
        event.currentTarget.classList.add("active");
        break;
      case "changePassword":
        setIsPersonalInfo(false);
        setIsChangePassword(true);
        event.currentTarget.classList.add("active");
        break;
      case "logOut":
        auth.logout();
        onLogOut();
        break;
    }
  };

  const handleShowPassword = (
    event: React.MouseEvent<HTMLImageElement>,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const img = event.currentTarget;
    const input = inputRef.current;
    if (!input) return;

    img.classList.toggle("show");
    const showing = img.classList.contains("show");

    img.src = showing
      ? "/images/view-password-icon.png"
      : "/images/hide-password-icon.png";

    input.type = showing ? "text" : "password"; // ← FIXED
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOldPsw = oldPswValue.trim() || "";
    const trimmedNewPsw = newPswValue.trim() || "";
    if (trimmedNewPsw.length < 8) {
      onPasswordChange("Password must be at least 8 characters", "error");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/user/password`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: trimmedOldPsw,
          newPassword: trimmedNewPsw,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        onPasswordChange(data.message || "Password update failed", "error");
        setOldPswValue("");
        setNewPswValue("");
        throw new Error("Password update failed");
      }

      onPasswordChange(data.message, "success");
      setOldPswValue("");
      setNewPswValue("");
    } catch (e) {
      console.error("Error in changing password", e);
    }
  };

  const handleUserDetailsChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameValue?.trim() || "";
    const trimmedSurname = surnameValue?.trim() || "";
    if (trimmedName.length < 2) {
      onUserChange("Name must be at least 2 characters", "error");
      return;
    }

    if (trimmedSurname.length < 2) {
      onUserChange("Surname must be at least 2 characters", "error");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/user/details`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameValue,
          surname: surnameValue,
          email: emailValue,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "User update failed");
      }
    } catch (e) {
      console.error("Error in changing user details", e);
    }
  };

  useEffect(() => {
    spansRef.current = document.querySelectorAll(".selection-span");
  }, []);

  return (
    <div className="profile-main-container">
      <div className="profile-inner-container">
        <div className="profile-left-container">
          <div className="profile-image-contianer">
            {auth.user?.photo_url && (
              <img src={auth.user.photo_url} alt={auth.user.name || "User"} />
            )}
          </div>
          <div className="profile-selection-container">
            <span
              id="personaInfo"
              className="selection-span active"
              onClick={(e) => {
                changeView(e);
              }}
            >
              Personal Info
            </span>
            <span
              id="changePassword"
              className="selection-span"
              onClick={(e) => {
                changeView(e);
              }}
            >
              Change Password
            </span>
            <span
              id="logOut"
              className="selection-span"
              onClick={(e) => {
                changeView(e);
              }}
            >
              Log Out
            </span>
          </div>
        </div>
        <div className="profile-right-container">
          {isPersonalInfo && (
            <>
              <form
                onSubmit={handleUserDetailsChange}
                className="user-details-form"
              >
                <div>
                  <input
                    type="text"
                    defaultValue={nameValue}
                    placeholder="Name"
                    onChange={(e) => setNameValue(e.target.value)}
                  />
                  <input
                    type="text"
                    defaultValue={surnameValue}
                    placeholder="Surname"
                    onChange={(e) => setSurnameValue(e.target.value)}
                  />
                </div>
                <div className="profile-email-container">
                  <input type="email" defaultValue={emailValue} disabled />
                </div>
                <div className="profile-buttons-container">
                  <button type="button">Cancel</button>
                  <button type="submit">Save Changes</button>
                </div>
              </form>
            </>
          )}
          {isChangePassword && (
            <>
              <form
                onSubmit={handlePasswordChange}
                className="password-change-form"
              >
                <div className="password-change-container">
                  <div>
                    <input
                      type="password"
                      placeholder="Old Password"
                      ref={oldPasswordRef}
                      value={oldPswValue}
                      onChange={(e) => setOldPswValue(e.target.value)}
                      autoComplete="current-password"
                    />
                    <img
                      src="images/hide-password-icon.png"
                      alt=""
                      onClick={(e) => handleShowPassword(e, oldPasswordRef)}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="New Password"
                      ref={newPasswordRef}
                      value={newPswValue}
                      onChange={(e) => setNewPswValue(e.target.value)}
                      autoComplete="new-password"
                    />
                    <img
                      src="images/hide-password-icon.png"
                      alt=""
                      onClick={(e) => handleShowPassword(e, newPasswordRef)}
                    />
                  </div>
                </div>
                <div className="profile-buttons-container">
                  <button type="button">Cancel</button>
                  <button type="submit">Save Changes</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
