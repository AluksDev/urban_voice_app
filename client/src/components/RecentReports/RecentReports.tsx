import React from "react";
import "./RecentReports.css";

const RecentReports = () => {
  return (
    <section className="recent-reports-container">
      <h3>Recent Reports</h3>
      <div className="report-card">
        <span>Category</span>
        <span>Date</span>
      </div>
      <div className="report-card">
        <span>Category</span>
        <span>Date</span>
      </div>
      <div className="report-card">
        <span>Category</span>
        <span>Date</span>
      </div>
    </section>
  );
};

export default RecentReports;
