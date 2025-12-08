import React, { useEffect, useState } from "react";
import "./RecentReports.css";

interface RecentReportsProps {
  refresh: number;
}

interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const RecentReports = ({ refresh }: RecentReportsProps) => {
  const apiUrl: string = import.meta.env.VITE_API_URL;
  const [latestReports, setLatestReports] = useState<Report[]>([]);

  const handleExapand = () => {
    document
      .querySelector(".recent-reports-expandable")
      ?.classList.toggle("show");
    document.getElementById("latestReportTitle")?.classList.toggle("active");
  };

  const fetchLatestReports = async () => {
    const limit = 3;
    try {
      const res = await fetch(`${apiUrl}/stats/reports/latest?limit=${limit}`);
      if (!res.ok) {
        throw new Error("Error in response");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setLatestReports(data.reports);
      console.log(data.reports);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchLatestReports();
  }, [refresh]);
  return (
    <section className="recent-reports-container" onClick={handleExapand}>
      <h3 id="latestReportTitle">Latest Reports</h3>
      <div className="recent-reports-expandable">
        {latestReports.map((report: Report) => {
          return (
            <div className="report-card" key={report.id}>
              <span>{report.title}</span>
              <span>{report.category}</span>
              <span>
                {new Date(report.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentReports;
