import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useRef, useState, useEffect } from "react";
const LineChartComponent = ({
  title,
  xData,
  yData,
  xLabel,
  yLabel,
  yMin,
  yMax,
}: {
  title?: string;
  xData: number[];
  yData: number[];
  xLabel: string;
  yLabel: string;
  // optional explicit y-axis bounds
  yMin?: number;
  yMax?: number;
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

            // compute y-axis domain (min/max) with a small padding unless explicitly provided
            const dataMin = yData && yData.length > 0 ? Math.min(...yData) : undefined;
            const dataMax = yData && yData.length > 0 ? Math.max(...yData) : undefined;
            let computedYMin: number | undefined = undefined;
            let computedYMax: number | undefined = undefined;

            if (typeof yMin === 'number') computedYMin = yMin;
            if (typeof yMax === 'number') computedYMax = yMax;

            if (dataMin !== undefined && dataMax !== undefined) {
              if (computedYMin === undefined || computedYMax === undefined) {
                // if all values equal, give a small +/- so the line is visible
                if (dataMax === dataMin) {
                  const pad = Math.max(1, Math.abs(dataMax) * 0.05);
                  computedYMin ??= Math.floor(dataMin - pad);
                  computedYMax ??= Math.ceil(dataMax + pad);
                } else {
                  const range = dataMax - dataMin;
                  const pad = range * 0.08; // 8% padding
                  computedYMin ??= Math.floor(dataMin - pad);
                  computedYMax ??= Math.ceil(dataMax + pad);
                }
              }
            }

            return (
              <>
                <style>{`.chart-dark svg circle{display:none !important;} .chart-dark svg g[role='presentation'] circle{display:none !important;}`}</style>
                <LineChart
                  xAxis={[
                    {
                      data: xData,
                      label: xLabel,
                      ...(minX !== undefined && { min: minX }),
                      ...(maxX !== undefined && { max: maxX }),
                      ...(tickValues.length > 0 && { tickValues }),
                      valueFormatter,
                    },
                  ]}
                  yAxis={[
                    {
                      label: yLabel,
                      ...(computedYMin !== undefined && { min: computedYMin }),
                      ...(computedYMax !== undefined && { max: computedYMax }),
                    },
                  ]}
                  series={[
                    {
                      data: yData,
                      label: yLabel,
                      color: chartColor,
                    },
                  ]}
                  slotProps={{
                    line: {
                      strokeWidth: 4,
                    },
                  }}
                  width={size.width}
                  height={size.height}
                />
              </>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default LineChartComponent;
