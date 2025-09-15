'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProjects, deleteProject } from '../../../../lib/savedAnalytics';
import ConfirmDeleteModal from '../../../../components/ConfirmDeleteModal';

export default function CustomAnalytics() {
  const [projects, setProjects] = useState([] as ReturnType<typeof loadProjects>);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/analytics/builder?saved=${id}`;
    if (navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  const handleExport = (id: string) => {
    router.push(`/analytics/builder?saved=${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
  };

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
            <li key={p.id} className="relative">
              <Link
                href={`/analytics/builder?saved=${p.id}`}
                className="block p-4 pr-8 border rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur hover:bg-white/20"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">
                  Created {new Date(p.createdAt).toLocaleString()}
                </div>
              </Link>
              <button
                className="absolute top-2 right-2 p-1 rounded hover:bg-white/20"
                onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
                <span className="sr-only">Options</span>
              </button>
              {menuOpen === p.id && (
                <div className="absolute right-2 z-10 mt-2 w-40 rounded border bg-white shadow-lg dark:bg-gray-800">
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      handleExport(p.id);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      handleShare(p.id);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      setDeleting(p.id);
                    }}
                    className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {deleting && (
        <ConfirmDeleteModal
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
    </div>
  );
}
