import { NavLink } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

type HeaderProps = {
  onOpenModal: () => void;
  openNewReport: () => void;
};

const Header = ({ onOpenModal, openNewReport }: HeaderProps) => {
  const auth = useAuth();
  const { t } = useTranslation();

  return (
    <header>
      <div className="header-first-line-container">
        <div className="logo-main-container">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "activeClass" : "")}
          >
            <div className="logo-image-container">
              <img src="images/logo.png" alt="Logo" />
            </div>
          </NavLink>
        </div>
        <nav className="nav-container">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "activeClass" : "")}
          >
            {t("header.dashboard")}
          </NavLink>
          {auth.isLoggedIn && (
            <NavLink
              to="/reports"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
            >
              {t("header.myReports")}
            </NavLink>
          )}
          {auth.isLoggedIn && (
            <NavLink
              to="/map"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
            >
              {t("header.map")}
            </NavLink>
          )}
        </nav>
        <div className="header-right-container">
          <div className="header-profile-main-container">
            {auth.isLoggedIn && (
              <NavLink to="user">
                <span>
                  {auth.user?.name} {auth.user?.surname}
                </span>
                <span>
                  <img src="images/profile-icon.jpg" alt="Profile Image" />
                </span>
              </NavLink>
            )}
          </div>
          <div className="header-options-container">
            <span className="night-mode-container">
              <img src="images/night-mode-icon.png" alt="" />
            </span>
            <span className="language-select-container">
              <img src="images/english-language-icon.png" alt="" />
            </span>
          </div>
        </div>
      </div>
      <div className="header-second-line-container">
        <div>
          {auth.isLoggedIn && (
            <h2>{t("header.welcome", { name: auth.user?.name })}</h2>
          )}
        </div>
        <div className="new-report-button-container">
          {auth.isLoggedIn ? (
            <button onClick={openNewReport}>{t("buttons.newReport")}</button>
          ) : (
            <button className="logIn-button" onClick={onOpenModal}>
              {t("buttons.login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
