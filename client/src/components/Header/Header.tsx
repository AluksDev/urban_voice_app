import { NavLink } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNotifications } from "../../context/NotificationsProvider";

type HeaderProps = {
  onOpenModal: () => void;
  openNewReport: () => void;
};

const Header = ({ onOpenModal, openNewReport }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const getLangFromCookie = () => {
    const match = document.cookie.match(/(^|;)\s*lang=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : "en";
  };
  const [selectedLang, setSelectedLang] = useState(getLangFromCookie());
  const { notifications, unreadCount, refreshNotifications, markAsRead } =
    useNotifications();
  const languages = [
    { code: "en", icon: "images/english-language-icon.png", label: "English" },
    { code: "es", icon: "images/spain-language-icon.png", label: "Español" },
    { code: "it", icon: "images/italy-language-icon.png", label: "Italiano" },
  ];

  const showLanguagesBox = () => {
    document.querySelector(".languages-box")?.classList.toggle("show");
  };

  const changeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLang(lang);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `lang=${lang};expires=${expires.toUTCString()};path=/`;
  };

  const showNotificationsBox = () => {
    document.querySelector(".notifications-box")?.classList.toggle("show");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "report":
        return "/images/notification-report-icon.svg";
      case "announcement":
        return "/images/notification-announcement-icon.svg";
      default:
        return "/images/notification-announcement-icon.svg";
    }
  };

  useEffect(() => {
    if (auth.user) {
      refreshNotifications();
    }
  }, [auth.user]);

  return (
    <header>
      <div className="header-first-line-container">
        <div className="logo-main-container">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "activeClass" : "")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="logo-image-container">
              <img src="images/logo.png" alt="Logo" />
            </div>
          </NavLink>
        </div>
        <nav
          className={`nav-container ${
            isMobileMenuOpen ? "mobile-menu-open" : ""
          }`}
        >
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "activeClass" : "")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t("header.dashboard")}
          </NavLink>
          {auth.isLoggedIn && (
            <NavLink
              to="/reports"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("header.myReports")}
            </NavLink>
          )}

          {auth.isLoggedIn && (
            <NavLink
              to="/map"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("header.map")}
            </NavLink>
          )}
          <div className="header-right-container">
            <div className="header-profile-main-container">
              {auth.isLoggedIn && (
                <NavLink to="user" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>
                    {auth.user?.name} {auth.user?.surname}
                  </span>
                  <span>
                    <img src={auth.user?.photo_url} alt="Profile Image" />
                  </span>
                </NavLink>
              )}
            </div>
            <div className="header-options-container">
              <span
                className="notifications-container"
                onClick={showNotificationsBox}
              >
                <span
                  className={`notification-counter ${unreadCount > 0 ? "active" : ""}`}
                >
                  {unreadCount > 0 && unreadCount}
                </span>
                <img src="images/notification-icon.svg" alt="" />
                <div
                  className="notifications-box"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="notifications-box-header">
                    {unreadCount > 0 ? (
                      <>
                        <span>Notifications</span>
                        <span>Mark all as read</span>
                      </>
                    ) : (
                      <span>No notifications</span>
                    )}
                  </div>
                  <div className="notifications-box-content">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="single-notification"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <span>
                          <img
                            src={getNotificationIcon(notification.type)}
                            alt=""
                          />
                        </span>
                        <span>{notification.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </span>

              <span
                className="language-select-container"
                onClick={() => {
                  showLanguagesBox();
                }}
              >
                <img
                  src={languages.find((l) => l.code === selectedLang)?.icon}
                  alt="Language flag"
                />
                <div className="languages-box">
                  {languages.map(
                    (lang) =>
                      lang.code !== selectedLang && (
                        <span
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                        >
                          <img src={lang.icon} alt={lang.label} />
                        </span>
                      ),
                  )}
                </div>
              </span>
            </div>
          </div>
        </nav>

        <div
          className="hamburger-container"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <img src="images/hamburger-menu.svg" alt="Menu" />
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
