import React from "react";
import MessagesBoard from "../../components/MessagesBoard/MessagesBoard";
import RecentReports from "../../components/RecentReports/RecentReports";
import Stats from "../../components/Stats/Stats";
import "./Homepage.css";

const Homepage = () => {
  return (
    <main>
      <div className="left-container">
        <MessagesBoard />
      </div>
      <div className="right-container">
        <RecentReports />
        <Stats />
      </div>
    </main>
  );
};

export default Homepage;
