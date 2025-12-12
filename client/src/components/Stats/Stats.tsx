import { useEffect, useState } from "react";
import "./Stats.css";
import PieChartComponent from "../PieChartComponent/PieChartComponent";
import SlotCounter from "react-slot-counter";
import { useTranslation } from "react-i18next";

interface StatsProps {
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

const Stats = ({ refresh }: StatsProps) => {
  const { t } = useTranslation();
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [reportsInProgress, setReportsInProgress] = useState<number>(0);
  const [reportsClosed, setReportsClosed] = useState<number>(0);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const getReportsCount = async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/reports`);
      if (!res.ok) {
        throw new Error(t("stats.errors.fetchFailed"));
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(t("stats.errors.fetchFailed"));
      }

      setReportsData(data.reports);
      setReportsCount(data.reports.length);

      let inProgress = 0;
      let closed = 0;

      data.reports.forEach((report: Report) => {
        if (report.status === "in_progress") inProgress += 1;
        else if (report.status === "closed") closed += 1;
      });

      setReportsInProgress(inProgress);
      setReportsClosed(closed);
    } catch (e) {
      console.error(e);
      // optionally display a toast or alert with the error
    }
  };

  useEffect(() => {
    getReportsCount();
  }, [refresh]);

  return (
    <section className="stats-container">
      <h3>{t("stats.title")}</h3>
      <div className="stats-box">
        <div>
          <div className="numeric-stat">
            <SlotCounter
              value={reportsCount}
              animateUnchanged={false}
              duration={2}
            />
            <p>{t("stats.labels.total")}</p>
          </div>
          <div className="numeric-stat">
            <SlotCounter
              value={reportsClosed}
              animateUnchanged={false}
              duration={2}
            />
            <p>{t("stats.labels.closed")}</p>
          </div>
          <div className="numeric-stat">
            <SlotCounter
              value={reportsInProgress}
              animateUnchanged={false}
              duration={2}
            />
            <p>{t("stats.labels.inProgress")}</p>
          </div>
        </div>
        <div className="pie-chart-container">
          <PieChartComponent
            reportsData={reportsData}
            isAnimationActive={true}
          />
        </div>
      </div>
    </section>
  );
};

export default Stats;
