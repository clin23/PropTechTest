'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';

export type CsvSection = {
  label: string;
  headers: string[];
  rows: (string | number)[][];
};

export type ChartRef = {
  id: string;
  label: string;
  element: HTMLElement | null;
};

type ExportButtonsProps = {
  csvSections: CsvSection[];
  charts: ChartRef[];
  fileName?: string;
};

function buildCsv(sections: CsvSection[]) {
  const lines: string[] = [];
  sections.forEach((section, index) => {
    if (index > 0) lines.push('');
    lines.push(section.label);
    lines.push(section.headers.join(','));
    section.rows.forEach((row) => {
      lines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    });
  });
  return lines.join('\n');
}

export default function ExportButtons({ csvSections, charts, fileName = 'analytics-overview' }: ExportButtonsProps) {
  const [selectedChartId, setSelectedChartId] = useState(charts[0]?.id ?? '');
  const hasCharts = charts.some((chart) => chart.element);

  const handleExportCsv = () => {
    if (!csvSections.length) return;
    const csvContent = buildCsv(csvSections);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = async () => {
    if (!hasCharts) return;
    const chart = charts.find((item) => item.id === selectedChartId) ?? charts[0];
    if (!chart?.element) return;
    const dataUrl = await toPng(chart.element, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}-${chart.id}.png`;
    link.click();
  };

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-[#1F2937] dark:bg-[#161B22]">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exports</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Download the current view</p>
      </header>
      <div className="space-y-2">
        <label htmlFor="export-chart" className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Chart selection
        </label>
        <select
          id="export-chart"
          value={selectedChartId}
          onChange={(event) => setSelectedChartId(event.target.value)}
          disabled={!hasCharts}
          className="w-full rounded-xl border border-slate-200/70 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F81F7] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#1F2937] dark:text-slate-200"
        >
          {charts.map((chart) => (
            <option key={chart.id} value={chart.id}>
              {chart.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!csvSections.length}
          className="flex-1 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2F81F7] hover:text-[#2F81F7] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#1F2937] dark:text-slate-200"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={handleExportPng}
          disabled={!hasCharts}
          className="flex-1 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2F81F7] hover:text-[#2F81F7] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#1F2937] dark:text-slate-200"
        >
          Export PNG
        </button>
      </div>
    </section>
  );
}
