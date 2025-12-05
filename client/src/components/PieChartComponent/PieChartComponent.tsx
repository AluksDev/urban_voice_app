import React, { useEffect, useState } from "react";
import { Pie, PieChart } from "recharts";
import "./PieChartComponent.css";
import { capitalize } from "../../utils";

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

interface PieChartComponentProps {
  isAnimationActive?: boolean;
}

const PieChartComponent = ({ isAnimationActive }: PieChartComponentProps) => {
  const [chartData, setChartData] = useState<{ [key: string]: any }[]>([]);

  const apiUrl: string = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${apiUrl}/stats/reports`);
        if (!res.ok) {
          throw new Error("Error in response");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        const reports: Report[] = data.reports;

        // Use a Map to count categories
        const counts: { [key: string]: number } = {};
        reports.forEach((report) => {
          counts[report.category] = (counts[report.category] || 0) + 1;
        });

        // Convert to array for Recharts
        setChartData(
          Object.entries(counts).map(([name, value]) => ({ name, value }))
        );
      } catch (e) {
        console.error(e);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="pie-chart-container">
      <PieChart
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          aspectRatio: 2,
        }}
        responsive
      >
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={chartData}
          cx="50%"
          cy="100%"
          outerRadius="120%"
          fill="#8884d8"
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            name,
          }) => {
            const RADIAN = Math.PI / 180;

            // Inner label (value inside slice)
            const innerRadiusValue =
              innerRadius + (outerRadius - innerRadius) / 2;
            const xValue =
              cx + innerRadiusValue * Math.cos(-midAngle! * RADIAN);
            const yValue =
              cy + innerRadiusValue * Math.sin(-midAngle! * RADIAN);

            // Outer label (name outside slice)
            const outerLabelRadius = outerRadius + 20; // 20px outside the slice
            const xName = cx + outerLabelRadius * Math.cos(-midAngle! * RADIAN);
            const yName = cy + outerLabelRadius * Math.sin(-midAngle! * RADIAN);

            return (
              <>
                <text
                  x={xValue}
                  y={yValue}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                >
                  {value}
                </text>
                <text
                  x={xName}
                  y={yName}
                  fill="white"
                  textAnchor={xName > cx ? "start" : "end"} // better alignment
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {capitalize(String(name))}
                </text>
              </>
            );
          }}
          isAnimationActive={isAnimationActive}
        />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;
