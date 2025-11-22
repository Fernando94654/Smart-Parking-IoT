import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useRef, useState, useEffect } from "react";
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
  const chartColor = "var(--accent-2)";
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if(!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if(!entry) return;
      const {width,height} = entry.contentRect ?? {width:0,height:0};
      setSize({width,height});
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [])

  return (
    <div className="h-full rounded-lg card-dark p-4 shadow-sm">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div ref={containerRef} className="w-full h-56 lg:h-110 chart-dark">
        {size.width > 0 && size.height > 0 && (
        <LineChart
          xAxis={[
            ({
              data: xData,
              label: xLabel,
              // format ticks for locale
              valueFormatter: (value: number) =>
                new Date(value).toLocaleString("es-MX", {
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }),
            }),
          ]}
          series={[
            {
              data: yData,
              label: yLabel,
              color: chartColor,
            },
          ]}
          width={size.width}
          height={size.height}
        />
        )}
      </div>
    </div>
  );
};

export default LineChartComponent;
