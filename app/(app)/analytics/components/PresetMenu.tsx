import { usePresets } from '../../../../hooks/useAnalytics';

export default function PresetMenu() {
  const { data } = usePresets();
  return (
    <div
      data-testid="preset-menu"
      className="p-4 border rounded-2xl shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      <div className="font-semibold mb-2">Presets</div>
      <ul className="list-disc pl-4 text-sm">
        {(data || []).map((p: any) => (
          <li key={p.id}>{p.name}</li>
        ))}
        {!data && <li className="list-none text-gray-500 dark:text-gray-400">None</li>}
      </ul>
    </div>
  );
}
