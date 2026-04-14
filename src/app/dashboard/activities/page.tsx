"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Home, FileText, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";

interface Activity {
  id: string;
  type?: string;
  text?: string;
  agent?: string;
  createdAt: string;
}

const typeIconMap: Record<string, React.ElementType> = {
  calls: Phone,
  visits: Home,
  notes: FileText,
  deals: CheckCircle2,
  payments: DollarSign,
};

const typeLabelMap: Record<string, string> = {
  calls: "Calls",
  visits: "Visits",
  notes: "Notes",
  deals: "Deals",
  payments: "Payments",
};

const typeStyleMap: Record<string, string> = {
  calls: "text-foreground bg-muted",
  visits: "text-foreground bg-muted",
  notes: "text-muted-foreground bg-muted",
  deals: "text-foreground bg-muted",
  payments: "text-foreground bg-muted",
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayLabel(dateString: string) {
  const date = new Date(dateString);
  return dayLabels[date.getDay()] || "";
}

function formatRelativeTime(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/activities");
        const json = await res.json();
        if (json.data) {
          setActivities(json.data as Activity[]);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        toast.error("Could not load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const activityCountsByType = useMemo(() => {
    return activities.reduce<Record<string, number>>((acc, activity) => {
      const typeKey = activity.type?.toLowerCase() ?? "notes";
      acc[typeKey] = (acc[typeKey] || 0) + 1;
      return acc;
    }, {});
  }, [activities]);

  const actTypeData = useMemo(
    () =>
      Object.entries(activityCountsByType).map(([type, count]) => ({
        type: typeLabelMap[type] ?? type,
        count,
        typeKey: type,
      })),
    [activityCountsByType]
  );

  const weeklyData = useMemo(() => {
    const counts = dayLabels.map((day) => ({ day, activities: 0 }));
    activities.forEach((activity) => {
      const day = getDayLabel(activity.createdAt);
      const entry = counts.find((item) => item.day === day);
      if (entry) entry.activities += 1;
    });
    return counts;
  }, [activities]);

  const recentActivities = useMemo(
    () => [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [activities]
  );

  const stats = useMemo(
    () => ({
      total: activities.length,
      calls: activityCountsByType.calls || 0,
      visits: activityCountsByType.visits || 0,
      deals: activityCountsByType.deals || 0,
    }),
    [activities.length, activityCountsByType]
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "This Week", value: loading ? "..." : stats.total.toString() },
          { label: "Calls Made", value: loading ? "..." : stats.calls.toString() },
          { label: "Visits Done", value: loading ? "..." : stats.visits.toString() },
          { label: "Deals Closed", value: loading ? "..." : stats.deals.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-medium tracking-tight text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Activity This Week</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line type="monotone" dataKey="activities" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ fill: "hsl(var(--foreground))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Activity by Type</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={actTypeData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--foreground))" fillOpacity={0.2} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
        </div>
        <div className="divide-y divide-border">
          {recentActivities.map((activity) => {
            const typeKey = activity.type?.toLowerCase() ?? "notes";
            const Icon = typeIconMap[typeKey] || Calendar;
            return (
              <div key={activity.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeStyleMap[typeKey] || "bg-muted text-foreground"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.text || typeLabelMap[typeKey] || "Activity"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.agent || "Unknown agent"}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(activity.createdAt)}</p>
              </div>
            );
          })}
          {recentActivities.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
