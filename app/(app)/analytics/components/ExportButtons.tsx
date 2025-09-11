import { downloadCsv, downloadPng } from '../../../../lib/download';
import { useRef } from 'react';

interface Props {
  csvData: string;
}

export default function ExportButtons({ csvData }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="flex gap-2" data-testid="export-buttons" ref={ref}>
      <button
        className="px-3 py-1 text-sm bg-gray-200 rounded"
        onClick={() => downloadCsv(csvData, 'analytics.csv')}
      >
        CSV
      </button>
      <button
        className="px-3 py-1 text-sm bg-gray-200 rounded"
        onClick={() => {
          if (ref.current) downloadPng(ref.current, 'chart.png');
        }}
      >
        PNG
      </button>
    </div>
  );
}
