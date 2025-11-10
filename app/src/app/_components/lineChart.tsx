import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

const LineChartComponent = ({
  title,
  xData,
  yData,
  xLabel,
  yLabel,
}: {
  title?: string;
  xData: number[];
  yData: number[];
  xLabel: string;
  yLabel: string;
}) => {
  const chartColor = "#1976d2"; // blue

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold text-blue-700">{title}</div>

      <LineChart
        xAxis={[
          {
            data: xData,
            label: xLabel,
            valueFormatter: (value: number) =>
              new Date(value).toLocaleString("es-MX", {
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }),
          },
        ]}
        series={[
          {
            data: yData,
            label: yLabel,
            color: chartColor,
          },
        ]}
        width={600}
        height={400}
      />
    </div>
  );
};

export default LineChartComponent;
