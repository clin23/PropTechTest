'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadProjects } from '../../../../lib/savedAnalytics';

export default function CustomAnalytics() {
  const [projects, setProjects] = useState([] as ReturnType<typeof loadProjects>);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  return (
    <div className="p-6">
      <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Analytics
      </Link>
      <h1 className="text-2xl font-semibold mb-4 mt-2">My Custom Analytics</h1>
      {projects.length === 0 ? (
        <p>No saved analytics yet.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id}>
              <Link
                href={`/analytics/builder?saved=${p.id}`}
                className="block p-4 border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur hover:bg-white/20"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">
                  Created {new Date(p.createdAt).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
