import type { AnalyticsStateType } from './schemas';

const KEY = 'custom-analytics';

export type SavedProject = {
  id: string;
  name: string;
  createdAt: string;
  state: AnalyticsStateType;
};

export function loadProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedProject[]) : [];
  } catch {
    return [];
  }
}

export function saveProject(name: string, state: AnalyticsStateType): SavedProject {
  const projects = loadProjects();
  const project: SavedProject = {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    state,
  };
  projects.push(project);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(projects));
  }
  return project;
}

export function getProject(id: string): SavedProject | undefined {
  return loadProjects().find(p => p.id === id);
}
