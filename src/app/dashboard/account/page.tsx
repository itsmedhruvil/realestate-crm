import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-foreground">My Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account details, profile settings, and notification preferences.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-medium text-foreground">Profile</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Update your name, email, and contact details here.
          </p>
          <div className="mt-6 space-y-2 text-sm text-foreground">
            <div className="rounded-xl bg-muted p-4">Name: Admin User</div>
            <div className="rounded-xl bg-muted p-4">Email: admin@propdesk.in</div>
            <div className="rounded-xl bg-muted p-4">Role: Administrator</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-medium text-foreground">Security</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Change your password or configure account security settings.
          </p>
          <div className="mt-6 space-y-3 text-sm text-foreground">
            <button className="w-full bg-foreground text-background py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
              Edit Profile
            </button>
            <button className="w-full bg-muted text-foreground py-3 rounded-xl text-sm font-medium hover:bg-muted/80 transition-all">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
