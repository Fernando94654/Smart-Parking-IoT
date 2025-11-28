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
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect ?? { width: 0, height: 0 };
      setSize({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="card-dark h-full rounded-lg p-4 shadow-sm">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div ref={containerRef} className="chart-dark h-44 sm:h-56 w-full lg:h-110">
        {size.width > 0 && size.height > 0 && (
          (() => {
            // compute responsive options
            const minX = xData && xData.length > 0 ? Math.min(...xData) : undefined;
            const maxX = xData && xData.length > 0 ? Math.max(...xData) : undefined;
            const tickCount = size.width < 420 ? 3 : size.width < 768 ? 5 : 8;
            const pointSize = size.width < 420 ? 4 : 6;
            // build explicit tick values from xData to avoid overlapping ticks
            const tickValues: number[] = [];
            if (xData && xData.length > 0) {
              const n = Math.min(tickCount, xData.length);
              for (let i = 0; i < n; i++) {
                const idx = Math.round((i * (xData.length - 1)) / Math.max(1, n - 1));
                tickValues.push(xData[idx]!);
              }
            }
            const valueFormatter = (value: number) => {
              const optsSmall = { hour: "numeric", minute: "numeric" } as const;
              const optsLarge = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" } as const;
              return new Date(value).toLocaleString("es-MX", size.width < 420 ? optsSmall : optsLarge);
            };

            return (
              <LineChart
                xAxis={[
                  {
                    data: xData,
                    label: xLabel,
                    // reduce empty margins by fixing domain to data range
                    ...(minX !== undefined && { min: minX }),
                    ...(maxX !== undefined && { max: maxX }),
                    // explicit tick values prevent overlap on small screens
                    ...(tickValues.length > 0 && { tickValues }),
                    valueFormatter,
                  },
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
            );
          })()
        )}
      </div>
    </div>
  );
};

export default LineChartComponent;
