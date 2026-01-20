import { useEffect, useRef, useState } from "react";
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
  const [size, setSize] = useState(300); // default size
  const containerRef = useRef<HTMLDivElement>(null);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FF8042",
    "#FFBB28",
    "#A28DD0",
    "#FF4560",
  ];

  // Prepare chart data
  useEffect(() => {
    if (!reportsData.length) return;

    const counts: { [key: string]: number } = {};
    reportsData.forEach((report) => {
      counts[report.category] = (counts[report.category] || 0) + 1;
    });

    const chartDataWithColors: ChartItem[] = Object.entries(counts).map(
      ([name, value], index) => ({
        name,
        value: Number(value),
        fill: COLORS[index % COLORS.length],
      }),
    );

    setChartData(chartDataWithColors);
  }, [reportsData]);

  // ResizeObserver for dynamic chart size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const chartSize = Math.max(150, Math.min(width, 350)); // min 200px, max 400px
      setSize(chartSize);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pie-chart-container"
      style={{ width: "100%" }}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={chartData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={size * 0.35}
          outerRadius={size * 0.45}
          isAnimationActive={isAnimationActive}
          activeShape={renderActiveShape}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={() => null} defaultIndex={defaultIndex} />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;
