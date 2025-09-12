import { downloadCsv, downloadPng } from '../../../../lib/download';
import { RefObject } from 'react';

interface Props {
  csvData: string;
  targetRef: RefObject<HTMLElement>;
}

export default function ExportButtons({ csvData, targetRef }: Props) {
  return (
    <div className="flex gap-2" data-testid="export-buttons">
      <button
        className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        onClick={() => downloadCsv(csvData, 'analytics.csv')}
      >
        CSV
      </button>
      <button
        className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        onClick={() => {
          if (targetRef.current) downloadPng(targetRef.current, 'chart.png');
        }}
      >
        PNG
      </button>
    </div>
  );
}
