"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Camera,
  Check,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const accountProfileStorageKey = "propdesk-account-profile";

type AccountProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string | null;
  notifications: Record<string, boolean>;
};

const preferences = [
  "New lead assignments",
  "Upcoming site visit reminders",
  "Payment due alerts",
  "Weekly performance summary",
];

const defaultNotifications = preferences.reduce<Record<string, boolean>>((values, preference) => {
  values[preference] = true;
  return values;
}, {});

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function profileFromUser(user: SupabaseUser): AccountProfile {
  const metadata = user.user_metadata || {};

  return {
    name: stringValue(metadata.full_name) || stringValue(metadata.name) || user.email?.split("@")[0] || "",
    email: user.email || "",
    phone: stringValue(metadata.phone),
    role: stringValue(metadata.role) || "Sales Agent",
    avatar: stringValue(metadata.avatar) || null,
    notifications:
      metadata.notifications && typeof metadata.notifications === "object"
        ? { ...defaultNotifications, ...(metadata.notifications as Record<string, boolean>) }
        : defaultNotifications,
  };
}

export default function AccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Sales Agent");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyProfile = (profile: Partial<AccountProfile>) => {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setRole(profile.role || "Sales Agent");
      setAvatarPreview(profile.avatar || null);
      setNotifications({ ...defaultNotifications, ...profile.notifications });
    };

    const loadAccount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user) {
        const storedProfile = window.localStorage.getItem(accountProfileStorageKey);
        if (storedProfile) {
          try {
            applyProfile(JSON.parse(storedProfile) as Partial<AccountProfile>);
          } catch {
            window.localStorage.removeItem(accountProfileStorageKey);
          }
        }
        setLoading(false);
        return;
      }

      const profile = profileFromUser(user);
      applyProfile(profile);
      window.localStorage.setItem(accountProfileStorageKey, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent("propdesk-account-updated", { detail: profile }));
      setLoading(false);
    };

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AC",
    [name]
  );

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
        setSaved(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAccountChanges = async () => {
    const profile: AccountProfile = {
      name,
      email,
      phone,
      role,
      avatar: avatarPreview,
      notifications,
    };

    setSaving(true);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({
      email,
      data: {
        full_name: name,
        phone,
        role,
        avatar: avatarPreview,
        notifications,
      },
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    window.localStorage.setItem(accountProfileStorageKey, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("propdesk-account-updated", { detail: profile }));
    setSaved(true);
    toast.success("Account profile saved.");
  };

  const accountStats = [
    { label: "Role", value: role },
    { label: "Last login", value: "Today, 09:42" },
    { label: "Workspace", value: "PropDesk CRM" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <section className="bg-card border border-border rounded-xl p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
              {avatarPreview ? (
                <img src={avatarPreview} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-foreground">
                  {initials}
                </div>
              )}
              <label className="absolute bottom-1.5 right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">My Account</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Update your photo, contact details, notification preferences, and security options.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {accountStats.map((stat) => (
                  <span
                    key={stat.label}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {stat.label}: {stat.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              onClick={saveAccountChanges}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-xs font-medium text-muted-foreground">Changes saved</span>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Profile Details</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Full name</span>
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Email address</span>
              <input
                type="email"
                value={email}
                suppressHydrationWarning
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Phone</span>
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Role</span>
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Administrator</option>
                <option>Manager</option>
                <option>Sales Agent</option>
              </select>
            </label>
          </div>
        </div>

        <div id="security" className="bg-card border border-border rounded-xl p-5 lg:p-6 scroll-mt-20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Security</h2>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                </div>
              </div>
            </div>
            <button className="w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 transition-all">
              Update Password
            </button>
            <button className="w-full rounded-lg border border-border py-3 text-sm font-medium text-foreground hover:bg-muted transition-all">
              Enable Two-Factor Auth
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div id="notifications" className="bg-card border border-border rounded-xl p-5 lg:p-6 scroll-mt-20">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Notifications</h2>
          </div>
          <div className="mt-5 space-y-3">
            {preferences.map((preference) => (
              <label
                key={preference}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 text-sm text-foreground"
              >
                <span>{preference}</span>
                <input
                  type="checkbox"
                  checked={notifications[preference] ?? true}
                  onChange={(event) => {
                    setNotifications((current) => ({
                      ...current,
                      [preference]: event.target.checked,
                    }));
                    setSaved(false);
                  }}
                  className="h-4 w-4 accent-foreground"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Account Status</h2>
          </div>
          <div className="mt-5 space-y-3">
            {["Email verified", "Admin access active", "CRM workspace connected"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 h-5 w-5 text-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Remove this user profile and revoke CRM access. This action should be used only after
                  transferring active leads and assignments.
                </p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
