import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  onOpenModal: () => void;
  openNewReport: () => void;
};

const Header = ({ onOpenModal, openNewReport }: HeaderProps) => {
  const auth = useAuth();
  return (
    <>
      <header>
        <div>
          <div className="logoContainer">
            <img src="images/logo.png" alt="Logo" />
          </div>
          <div>
            {auth.isLoggedIn ? (
              <h2>Welcome, {auth.user?.name}</h2>
            ) : (
              <h2>Welcome</h2>
            )}
          </div>
        </div>
        <nav className="navContainer">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "activeClass" : "")}
          >
            Dashboard
          </NavLink>
          {auth.isLoggedIn && (
            <NavLink
              to="/reports"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
            >
              My Reports
            </NavLink>
          )}
          {auth.isLoggedIn && (
            <NavLink
              to="/map"
              className={({ isActive }) => (isActive ? "activeClass" : "")}
            >
              Map
            </NavLink>
          )}
        </nav>
        <div>
          {auth.isLoggedIn && (
            <NavLink to={`users/${auth.user?.id}`}>
              <div className="profile-container">
                <span>
                  {auth.user?.name} {auth.user?.surname}
                </span>
                <span>
                  <img src="images/profile-icon.jpg" alt="Profile Image" />
                </span>
              </div>
            </NavLink>
          )}
          <div className="new-report-button-container">
            {auth.isLoggedIn ? (
              <button onClick={openNewReport}>New report</button>
            ) : (
              <button onClick={onOpenModal}>Log In // Sign Up</button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
