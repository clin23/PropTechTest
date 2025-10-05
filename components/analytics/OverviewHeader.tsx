'use client';

export default function OverviewHeader() {
  return (
    <header className="flex flex-col gap-2 text-left">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Overview</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Your portfolio performance snapshot</p>
    </header>
  );
}
