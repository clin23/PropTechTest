import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <Link href="/settings/notifications">Notifications</Link>
        </li>
      </ul>
    </div>
  );
}
