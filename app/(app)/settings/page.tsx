import Link from "next/link";
import PageHeader from "../../../components/PageHeader";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Settings" />
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <Link href="/settings/notifications">Notification Preferences</Link>
        </li>
      </ul>
    </div>
  );
}
