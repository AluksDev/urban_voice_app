import React from "react";
import "./Header.css";

const Header = () => {
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
            <button>New report</button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
