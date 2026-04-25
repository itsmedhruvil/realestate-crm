"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2, Lock, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Sales Agent");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLabel = isRegister ? "Create account" : "Sign in";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isRegister && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone,
              role,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          toast.success("Account created. Check your email to confirm your account.");
          router.push("/signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-10">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <Building2 className="h-4 w-4" />
            </span>
            PropDesk
          </Link>

          <div className="mt-16 max-w-md lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Real estate CRM
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Keep every lead, property, visit, and payment in one workspace.
            </h1>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Sign in to manage your pipeline, team activity, client follow-ups, and deal movement across the entire dashboard.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border p-3">
              <span className="block text-lg font-semibold text-foreground">8</span>
              CRM routes
            </div>
            <div className="rounded-lg border border-border p-3">
              <span className="block text-lg font-semibold text-foreground">24/7</span>
              Access
            </div>
            <div className="rounded-lg border border-border p-3">
              <span className="block text-lg font-semibold text-foreground">1</span>
              Login
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
                {isRegister ? <UserPlus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-foreground">
                {isRegister ? "Create your account" : "Sign in to PropDesk"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isRegister
                  ? "Register a new workspace user with email and password."
                  : "Use your registered email and password to open the CRM."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">Full name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Phone</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      autoComplete="tel"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      placeholder="+91 98765 43210"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Role</span>
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Administrator</option>
                      <option>Manager</option>
                      <option>Sales Agent</option>
                    </select>
                  </label>
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Minimum 6 characters"
                />
              </label>

              {isRegister && (
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Repeat password"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLabel}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Need an account?"}{" "}
              <Link
                href={isRegister ? "/signin" : "/register"}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {isRegister ? "Sign in" : "Register"}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
