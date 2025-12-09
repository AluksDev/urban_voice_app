import React, { useEffect, useState } from "react";
import "./PieChartComponent.css";
import { capitalize } from "../../utils";
import { Pie, PieChart, Sector, Tooltip, Cell } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import type { TooltipIndex } from "recharts/types/state/tooltipSlice";

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

interface ChartItem {
  name: string;
  value: number;
  fill: string;
  [key: string]: any;
}

interface ChartProps {
  isAnimationActive?: boolean;
  defaultIndex?: TooltipIndex;
  reportsData: Report[];
}

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 1));
  const cos = Math.cos(-RADIAN * (midAngle ?? 1));
  const innerPoint = innerRadius ?? 0;
  const deeperPoint = (innerRadius ?? 0) - 20;

  const sx = (cx ?? 0) + innerPoint * cos;
  const sy = (cy ?? 0) + innerPoint * sin;

  const mx = (cx ?? 0) + deeperPoint * cos;
  const my = (cy ?? 0) + deeperPoint * sin;

  const ex = mx;
  const ey = my;

  // small padding away from the connector
  const padding = 6;
  const paddedX = ex + (cos >= 0 ? -padding : padding);
  const paddedY = ey;

  const textAnchor = cos >= 0 ? "end" : "start";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {capitalize(payload.name)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={paddedX} y={paddedY} textAnchor={textAnchor} fill="white">{`${(
        (percent ?? 1) * 100
      ).toFixed(2)}%`}</text>
    </g>
  );
};

const PieChartComponent = ({
  isAnimationActive = true,
  defaultIndex = undefined,
  reportsData,
}: ChartProps) => {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const COLORS = [
    "#0088FE", // blue
    "#00C49F", // teal/green
    "#FF8042", // orange
    "#FFBB28", // yellow
    "#A28DD0", // purple
    "#FF4560", // red/pink
  ];

  useEffect(() => {
    if (reportsData.length === 0) return;
    // Use a Map to count categories
    const counts: { [key: string]: number } = {};
    reportsData.forEach((report) => {
      counts[report.category] = (counts[report.category] || 0) + 1;
    });

    // Convert to array for Recharts
    const chartDataWithColors: ChartItem[] = Object.entries(counts).map(
      ([name, value], index) => ({
        name,
        value: Number(value),
        fill: COLORS[index % COLORS.length],
      })
    );
    setChartData(chartDataWithColors);
  }, [reportsData]);
  if (chartData.length === 0) return null;
  return (
    <PieChart width={400} height={400}>
      <Pie
        activeShape={renderActiveShape}
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="90%"
        dataKey="value"
        isAnimationActive={isAnimationActive}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip content={() => null} defaultIndex={defaultIndex} />
    </PieChart>
  );
};

export default PieChartComponent;
