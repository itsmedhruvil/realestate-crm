"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  useEffect(() => {
    supabase.auth.signOut();
    window.localStorage.removeItem("propdesk-account-profile");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background">
          <LogOut className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-foreground">You are signed out</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your local CRM session has been cleared from this browser.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Sign in again
        </Link>
      </section>
    </main>
  );
}
