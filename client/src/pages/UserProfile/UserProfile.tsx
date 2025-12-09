import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

interface UserProfileProps {
  onLogOut: () => void;
}

const UserProfile = ({ onLogOut }: UserProfileProps) => {
  const auth = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    spansRef.current = document.querySelectorAll(".selection-span");
  }, []);

  return (
    <div className="profile-main-container">
      <div className="profile-inner-container">
        <div className="profile-left-container">
          <div className="profile-image-contianer">
            <img src={auth.user?.photo_url} alt="" />
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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
