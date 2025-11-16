import React from "react";
import MessagesBoard from "../../components/MessagesBoard/MessagesBoard";
import RecentReports from "../../components/RecentReports/RecentReports";
import Stats from "../../components/Stats/Stats";

const Homepage = () => {
  return (
    <main>
      <MessagesBoard />
      <RecentReports />
      <Stats />
    </main>
  );
};

export default Homepage;
