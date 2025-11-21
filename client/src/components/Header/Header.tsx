import React from "react";
import "./Header.css";

type HeaderProps = {
  isLoggedIn: boolean;
  onOpenModal: () => void;
};

const Header = ({ isLoggedIn, onOpenModal }: HeaderProps) => {
  return (
    <>
      <header>
        <div>
          <div className="logoContainer">
            <img src="images/logo.png" alt="Logo" />
          </div>
          <div>
            <h2>Welcome, User</h2>
          </div>
        </div>
        <nav className="navContainer">
          <span>Dashboard</span>
          <span>My Reports</span>
          <span>Map</span>
        </nav>
        <div>
          <div className="profile-container">
            <span>Nombre Apellido</span>
            <span>
              <img src="images/profile-icon.jpg" alt="Profile Image" />
            </span>
          </div>
          <div className="new-report-container">
            {isLoggedIn ? (
              <button>New report</button>
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
