import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./UserProfile.css";

interface UserProfileProps {
  onLogOut: () => void;
}

const UserProfile = ({ onLogOut }: UserProfileProps) => {
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
  const [isPersonalInfo, setIsPersonalInfo] = useState<boolean>(true);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);

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
              <div>
                <input type="text" defaultValue={nameValue} />
                <input type="text" defaultValue={surnameValue} />
              </div>
              <div>
                <input type="text" defaultValue={emailValue} />
              </div>
              <div className="profile-buttons-container">
                <button type="button">Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </>
          )}
          {isChangePassword && (
            <>
              <div className="password-change-container">
                <div>
                  <input
                    type="password"
                    placeholder="Old Password"
                    ref={oldPasswordRef}
                  />
                  <img
                    src="images/hide-password-icon.png"
                    alt=""
                    onClick={(e) => handleShowPassword(e, oldPasswordRef)}
                  />
                </div>{" "}
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    ref={newPasswordRef}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
