import {
  Bell,
  Building2,
  CalendarClock,
  Database,
  Globe2,
  KeyRound,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

const settingGroups = [
  {
    title: "Workspace",
    description: "Control the company details shown across reports, emails, and CRM records.",
    icon: Building2,
    fields: [
      { label: "Company name", value: "PropDesk Realty" },
      { label: "Default city", value: "Ahmedabad" },
      { label: "Support email", value: "support@propdesk.in" },
      { label: "Currency", value: "INR" },
    ],
  },
  {
    title: "Lead Routing",
    description: "Set how new inquiries are assigned to agents and sales teams.",
    icon: RefreshCcw,
    fields: [
      { label: "Assignment mode", value: "Round robin" },
      { label: "Response SLA", value: "15 minutes" },
      { label: "Reassign stale leads after", value: "24 hours" },
      { label: "Default lead owner", value: "Admin User" },
    ],
  },
];

const notificationSettings = [
  "Send email when a new lead is created",
  "Notify assigned agent before site visits",
  "Alert admins for overdue payments",
  "Send weekly performance digest every Monday",
];

const systemInfo = [
  { label: "Application", value: "EstateOS CRM" },
  { label: "Environment", value: "Production" },
  { label: "Data refresh", value: "Every 5 minutes" },
  { label: "Backup schedule", value: "Daily at 02:00" },
];

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <section className="bg-card border border-border rounded-xl p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Configure workspace information, lead assignment rules, reminders, integrations,
              and the system details your real estate team uses every day.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity">
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-card border border-border rounded-xl p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <group.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-medium text-foreground">{group.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <label key={field.label} className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                  <input
                    defaultValue={field.value}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr]">
        <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Notifications</h2>
          </div>
          <div className="mt-5 space-y-3">
            {notificationSettings.map((setting) => (
              <label
                key={setting}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 text-sm text-foreground"
              >
                <span>{setting}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-foreground" />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Access & Integrations</h2>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { icon: Mail, title: "Email provider", value: "SMTP connected" },
              { icon: CalendarClock, title: "Calendar sync", value: "Google Calendar" },
              { icon: Globe2, title: "Website forms", value: "Active on 3 forms" },
              { icon: ShieldCheck, title: "Admin approvals", value: "Required for exports" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">System Info</h2>
          </div>
          <div className="mt-5 space-y-3">
            {systemInfo.map((item) => (
              <div key={item.label} className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
