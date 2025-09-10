import { usePresets } from '../../../hooks/useAnalytics';

export default function PresetMenu() {
  const { data } = usePresets();
  return (
    <div data-testid="preset-menu" className="p-4 border rounded-2xl shadow-sm">
      <div className="font-semibold mb-2">Presets</div>
      <ul className="list-disc pl-4 text-sm">
        {(data || []).map((p: any) => (
          <li key={p.id}>{p.name}</li>
        ))}
        {!data && <li className="list-none text-gray-500">None</li>}
      </ul>
    </div>
  );
}
