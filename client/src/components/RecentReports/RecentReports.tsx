import { useEffect, useState } from "react";
import "./RecentReports.css";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";

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
  const { t } = useTranslation();
  const [latestReports, setLatestReports] = useState<Report[]>([]);

  const handleExapand = () => {
    document
      .querySelector(".recent-reports-expandable")
      ?.classList.toggle("show");
    document.getElementById("latestReportTitle")?.classList.toggle("active");
  };

  const fetchLatestReports = async () => {
    const limit = 5;
    try {
      const res = await fetch(`${apiUrl}/stats/reports/latest?limit=${limit}`);
      if (!res.ok) {
        throw new Error(t("recentReports.errors.fetchFailed"));
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(t("recentReports.errors.fetchFailed"));
      }
      setLatestReports(data.reports);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchLatestReports();
  }, [refresh]);
  return (
    <section className="recent-reports-container" onClick={handleExapand}>
      <h3 id="latestReportTitle">{t("recentReports.title")}</h3>
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
