"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  UserCheck,
  Calendar,
  CreditCard,
  Activity,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/leads", label: "Leads", icon: UserCheck },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/team", label: "Team", icon: Briefcase },
  { href: "/dashboard/activities", label: "Activity", icon: Activity },
  { href: "/dashboard/site-visits", label: "Site Visits", icon: Calendar },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

type SearchRecord = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  href: string;
};

const searchSources = [
  { endpoint: "/api/properties", type: "Property", href: "/dashboard/properties", fields: ["name", "location", "type", "status"] },
  { endpoint: "/api/leads", type: "Lead", href: "/dashboard/leads", fields: ["name", "email", "phone", "interest", "stage"] },
  { endpoint: "/api/clients", type: "Client", href: "/dashboard/clients", fields: ["name", "email", "phone", "propertyInterest", "status"] },
  { endpoint: "/api/team", type: "Team", href: "/dashboard/team", fields: ["name", "email", "phone", "role", "status"] },
  { endpoint: "/api/visits", type: "Visit", href: "/dashboard/site-visits", fields: ["client", "property", "agent", "status", "date"] },
  { endpoint: "/api/payments", type: "Payment", href: "/dashboard/payments", fields: ["client", "property", "status", "dueDate"] },
];

const accountProfileStorageKey = "propdesk-account-profile";

type AccountProfile = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string | null;
};

const defaultAccountProfile: AccountProfile = {
  name: "Account",
  email: "",
  phone: "",
  role: "",
  avatar: null,
};

function stringValue(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function recordTitle(record: Record<string, unknown>, fallback: string) {
  return stringValue(record.name) || stringValue(record.client) || stringValue(record.property) || fallback;
}

function accountInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AC"
  );
}

function profileFromUser(user: SupabaseUser): AccountProfile {
  const metadata = user.user_metadata || {};
  const name = stringValue(metadata.full_name) || stringValue(metadata.name) || user.email?.split("@")[0] || "Account";

  return {
    name,
    email: user.email || "",
    phone: stringValue(metadata.phone),
    role: stringValue(metadata.role),
    avatar: stringValue(metadata.avatar) || null,
  };
}

function AccountAvatar({
  profile,
  className,
  textClassName,
}: {
  profile: AccountProfile;
  className: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden bg-muted flex items-center justify-center font-semibold text-foreground shrink-0", className)}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
      ) : (
        <span className={textClassName}>{accountInitials(profile.name)}</span>
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [accountProfile, setAccountProfile] = useState<AccountProfile>(defaultAccountProfile);
  const pathname = usePathname();
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const readStoredProfile = () => {
      const storedProfile = window.localStorage.getItem(accountProfileStorageKey);
      if (!storedProfile) {
        setAccountProfile(defaultAccountProfile);
        return;
      }

      try {
        setAccountProfile({ ...defaultAccountProfile, ...JSON.parse(storedProfile) });
      } catch {
        window.localStorage.removeItem(accountProfileStorageKey);
        setAccountProfile(defaultAccountProfile);
      }
    };

    const loadSupabaseProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        readStoredProfile();
        return;
      }

      const profile = profileFromUser(user);
      window.localStorage.setItem(accountProfileStorageKey, JSON.stringify(profile));
      setAccountProfile({ ...defaultAccountProfile, ...profile });
    };

    const handleAccountUpdated = (event: Event) => {
      const profile = (event as CustomEvent<AccountProfile>).detail;
      setAccountProfile({ ...defaultAccountProfile, ...profile });
    };

    loadSupabaseProfile();
    window.addEventListener("storage", readStoredProfile);
    window.addEventListener("propdesk-account-updated", handleAccountUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", readStoredProfile);
      window.removeEventListener("propdesk-account-updated", handleAccountUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSearchData = async () => {
      setSearchLoading(true);
      try {
        const responses = await Promise.allSettled(
          searchSources.map(async (source) => {
            const response = await fetch(source.endpoint);
            if (!response.ok) return [];

            const json = await response.json();
            const rows = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

            return rows.map((row: Record<string, unknown>, index: number) => ({
              id: stringValue(row.id) || `${source.type}-${index}`,
              title: recordTitle(row, source.type),
              subtitle: source.fields
                .map((field) => stringValue(row[field]))
                .filter(Boolean)
                .slice(1, 4)
                .join(" • "),
              type: source.type,
              href: source.href,
              searchText: source.fields.map((field) => stringValue(row[field])).join(" ").toLowerCase(),
            }));
          })
        );

        if (cancelled) return;

        const records = responses.flatMap((response) =>
          response.status === "fulfilled" ? response.value : []
        );
        setSearchRecords(records);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };

    loadSearchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchRecords
      .filter((record: SearchRecord & { searchText?: string }) => record.searchText?.includes(query))
      .slice(0, 8);
  }, [searchQuery, searchRecords]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstResult = searchResults[0];
    if (firstResult) {
      setSearchOpen(false);
      router.push(firstResult.href);
    }
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.localStorage.removeItem(accountProfileStorageKey);
      setAccountProfile(defaultAccountProfile);
      setAccountOpen(false);
      setMobileOpen(false);
      router.push("/logout");
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-border px-4 shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold text-sm tracking-tight">PropDesk</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-background" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border p-2 space-y-0.5 shrink-0">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* User */}
          {!collapsed && (
            <Link
              href="/dashboard/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-muted transition-colors"
            >
              <AccountAvatar profile={accountProfile} className="w-7 h-7 rounded-full" textClassName="text-xs" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{accountProfile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{accountProfile.email}</p>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div ref={searchRef} className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <form onSubmit={submitSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search properties, leads, clients..."
                  className="pl-9 pr-9 py-2 text-sm bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-ring w-56 lg:w-72 placeholder:text-muted-foreground"
                />
              </form>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-11 left-0 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.href}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="block px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {result.type}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="mt-1 text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No matching records found.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-muted border border-foreground rounded-full" />
            </button>
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
              >
                <AccountAvatar profile={accountProfile} className="h-full w-full rounded-full" textClassName="text-xs" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-11 w-72 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <AccountAvatar profile={accountProfile} className="w-10 h-10 rounded-full" textClassName="text-sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{accountProfile.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{accountProfile.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/account"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    <Link
                      href="/dashboard/account#security"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Security
                    </Link>
                    <Link
                      href="/dashboard/account#notifications"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Notifications
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
