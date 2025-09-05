"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface MonthlyNet {
  month: string;
  net: number;
}

export default function PnLChart({ data }: { data: MonthlyNet[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const Chart = (window as any).Chart;
    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: data.map((d) => d.month),
        datasets: [
          {
            label: "Net",
            data: data.map((d) => d.net),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      },
    });
    return () => chart.destroy();
  }, [ready, data]);

  return (
    <div className="h-64">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onLoad={() => setReady(true)} />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
