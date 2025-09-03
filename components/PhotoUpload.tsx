import { useState } from 'react';

export default function PhotoUpload({ onUpload }: { onUpload?: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const list = Array.from(e.target.files || []);
          setFiles(list);
          onUpload?.(list);
        }}
      />
      <div className="flex gap-2 mt-2 flex-wrap">
        {files.map((f, i) => (
          <span key={i} className="text-xs bg-gray-100 p-1 rounded">
            {f.name}
          </span>
        ))}
      </div>
    </div>
  );
}
