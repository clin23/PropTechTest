'use client';

import { useId, useState } from 'react';

interface Props {
  onUpload?: (files: File[]) => void;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoUpload({
  onUpload,
  maxSizeMb = Number(process.env.MAX_UPLOAD_MB) || Infinity,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    const valid = list.filter(
      (f) =>
        ACCEPTED_TYPES.includes(f.type) &&
        f.size <= maxSizeMb * 1024 * 1024
    );

    if (valid.length) {
      setFiles(valid);
      onUpload?.(valid);
    } else {
      setFiles([]);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="block mb-1">
        Upload Photos
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
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
