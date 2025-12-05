import React, { useEffect, useState } from "react";
import "./Stats.css";
import PieChartComponent from "../PieChartComponent/PieChartComponent";
import SlotCounter from "react-slot-counter";

const Stats = () => {
  const [reportsCount, setReportsCount] = useState<number>(0);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const getReportsCount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/reports`);
      if (!res.ok) {
        throw new Error("Error in response");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setReportsCount(data.reports.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getReportsCount();
  }, []);
  return (
    <section className="stats-container">
      <h3>Statistics</h3>
      <PieChartComponent isAnimationActive={true} />
      <div>
        <p>Total</p>
        <SlotCounter value={reportsCount} animateUnchanged={false} />
      </div>
      <div>3</div>
    </section>
  );
};

export default Stats;
