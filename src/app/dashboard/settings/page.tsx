export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure app-level settings, notifications, and system preferences from here.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-medium text-foreground">Notifications</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Enable or disable updates, reminders and activity notifications.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-medium text-foreground">Preferences</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Adjust your dashboard preferences, theme and data refresh behavior.
          </p>
        </div>
      </div>
    </div>
  );
}
