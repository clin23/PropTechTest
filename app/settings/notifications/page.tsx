import NotificationPrefsForm from '../../../components/NotificationPrefsForm';

export default function NotificationSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Notification Settings</h1>
      <NotificationPrefsForm />
    </div>
  );
}
