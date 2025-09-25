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

type Props = {
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

export function ExportButtons({ csvSections, charts, fileName = 'analytics-overview' }: Props) {
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
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="export-chart" className="text-gray-600 dark:text-gray-300">
          Chart
        </label>
        <select
          id="export-chart"
          value={selectedChartId}
          onChange={(event) => setSelectedChartId(event.target.value)}
          disabled={!hasCharts}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {charts.map((chart) => (
            <option key={chart.id} value={chart.id}>
              {chart.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleExportCsv}
          disabled={!csvSections.length}
        >
          Export CSV
        </button>
        <button
          type="button"
          className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleExportPng}
          disabled={!hasCharts}
        >
          Export PNG
        </button>
      </div>
    </div>
  );
}

export default ExportButtons;
