import React from "react";
import MessagesBoard from "../../components/MessagesBoard/MessagesBoard";
import RecentReports from "../../components/RecentReports/RecentReports";
import Stats from "../../components/Stats/Stats";
import "./Homepage.css";

interface HomepageProps {
  refresh: number;
}

const Homepage = ({ refresh }: HomepageProps) => {
  return (
    <main>
      <div className="left-container">
        <MessagesBoard />
      </div>
      <div className="right-container">
        <RecentReports refresh={refresh} />
        <Stats refresh={refresh} />
      </div>
    </main>
  );
};

export default Homepage;
