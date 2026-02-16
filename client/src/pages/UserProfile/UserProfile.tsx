import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import "./UserProfile.css";
import { apiRequest } from "../../api";

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
  const { updateUser } = useAuth();
  const { t } = useTranslation();

  const [nameValue, setNameValue] = useState<string | undefined>(
    auth.user?.name,
  );
  const [surnameValue, setSurnameValue] = useState<string | undefined>(
    auth.user?.surname,
  );
  const [oldPswValue, setOldPswValue] = useState<string>("");
  const [newPswValue, setNewPswValue] = useState<string>("");
  const [isPersonalInfo, setIsPersonalInfo] = useState<boolean>(true);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);

  const spansRef = useRef<NodeListOf<HTMLSpanElement> | null>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function changeView(event: React.MouseEvent<HTMLSpanElement>) {
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
  }

  function handleShowPassword(
    event: React.MouseEvent<HTMLImageElement>,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) {
    const img = event.currentTarget;
    const input = inputRef.current;
    if (!input) return;

    img.classList.toggle("show");
    const showing = img.classList.contains("show");

    img.src = showing
      ? "/images/view-password-icon.png"
      : "/images/hide-password-icon.png";

    input.type = showing ? "text" : "password";
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    const trimmedOldPsw = oldPswValue.trim() || "";
    const trimmedNewPsw = newPswValue.trim() || "";
    if (trimmedNewPsw.length < 8) {
      onPasswordChange(t("userProfile.passwordLengthError"), "error");
      return;
    }
    try {
      const data = await apiRequest(`user/password`, {
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

      onPasswordChange(data.message, "success");
      setOldPswValue("");
      setNewPswValue("");
    } catch (e) {
      console.error("Error in changing password", e);
    }
  }

  async function handleUserDetailsChange(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = nameValue?.trim() || "";
    const trimmedSurname = surnameValue?.trim() || "";
    if (trimmedName.length < 2) {
      onUserChange(t("userProfile.nameLengthError"), "error");
      return;
    }

    if (trimmedSurname.length < 2) {
      onUserChange(t("userProfile.surnameLengthError"), "error");
      return;
    }
    try {
      const data = await apiRequest(`user/details`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          surname: trimmedSurname,
        }),
      });

      updateUser({
        name: trimmedName,
        surname: trimmedSurname,
      });
      onUserChange(data.message, "success");
    } catch (e) {
      console.error("Error in changing user details", e);
    }
  }

  function handlePhotoClick() {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  }
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onUserChange(t("userProfile.messages.INVALID_IMAGE"), "error");
      console.error("Selected file is not an image");
      return;
    }
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const data = await apiRequest(`user/photo`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      updateUser({ photo_url: data.photo_url });
      onUserChange(t("userProfile.messages.PHOTO_UPDATE_SUCCESS"), "success");
    } catch (e) {
      console.error("Error in changing photo", e);
    }
  }
  useEffect(() => {
    spansRef.current = document.querySelectorAll(".selection-span");
  }, []);

  return (
    <div className="profile-main-container">
      <div className="profile-inner-container">
        <div className="profile-left-container">
          <div className="profile-image-container">
            {auth.user?.photo_url && (
              <img src={auth.user.photo_url} alt={auth.user.name || "User"} />
            )}
            <span onClick={handlePhotoClick}>
              <img src="images/edit-photo-icon.png" alt="" />
            </span>
            <input
              type="file"
              ref={photoInputRef}
              accept="image/jpeg, image/webp, image/png"
              onChange={handlePhotoChange}
              capture="user"
              hidden
            />
          </div>
          <div className="profile-selection-container">
            <span
              id="personaInfo"
              className="selection-span active"
              onClick={(e) => changeView(e)}
            >
              {t("userProfile.personalInfo")}
            </span>
            <span
              id="changePassword"
              className="selection-span"
              onClick={(e) => changeView(e)}
            >
              {t("userProfile.changePassword")}
            </span>
            <span
              id="logOut"
              className="selection-span"
              onClick={(e) => changeView(e)}
            >
              {t("userProfile.logOut")}
            </span>
          </div>
        </div>
        <div className="profile-right-container">
          {isPersonalInfo && (
            <form
              onSubmit={handleUserDetailsChange}
              className="user-details-form"
            >
              <div>
                <input
                  type="text"
                  value={nameValue}
                  placeholder={t("userProfile.namePlaceholder")}
                  onChange={(e) => setNameValue(e.target.value)}
                />
                <input
                  type="text"
                  value={surnameValue}
                  placeholder={t("userProfile.surnamePlaceholder")}
                  onChange={(e) => setSurnameValue(e.target.value)}
                />
              </div>
              <div className="profile-email-container">
                <input type="email" defaultValue={auth.user?.email} disabled />
                <span className="profile-email-message">
                  {t("userProfile.emailCantChange")}
                </span>
              </div>
              <div className="profile-buttons-container">
                <button
                  type="button"
                  onClick={() => {
                    setNameValue(auth.user?.name);
                    setSurnameValue(auth.user?.surname);
                  }}
                >
                  {t("userProfile.cancel")}
                </button>
                <button type="submit">{t("userProfile.saveChanges")}</button>
              </div>
            </form>
          )}
          {isChangePassword && (
            <form
              onSubmit={handlePasswordChange}
              className="password-change-form"
            >
              <div className="password-change-container">
                <div>
                  <input
                    type="password"
                    placeholder={t("userProfile.oldPassword")}
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
                    placeholder={t("userProfile.newPassword")}
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
                <button
                  type="button"
                  onClick={() => {
                    setOldPswValue("");
                    setNewPswValue("");
                  }}
                >
                  {t("userProfile.cancel")}
                </button>
                <button type="submit">{t("userProfile.saveChanges")}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
