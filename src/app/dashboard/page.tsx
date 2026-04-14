"use client";

import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back, Admin</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening with your real estate business today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center justify-center text-center">
           <LayoutDashboard className="w-10 h-10 text-muted-foreground mb-4 opacity-20" />
           <p className="text-sm text-muted-foreground">Select a category from the sidebar to view detailed information.</p>
        </div>
      </div>
    </div>
  );
}