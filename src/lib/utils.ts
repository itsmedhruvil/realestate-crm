import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function getLeadScoreColor(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: "hsl(var(--grey-800))", text: "hsl(var(--foreground))" };
  if (score >= 60) return { bg: "hsl(var(--grey-700))", text: "hsl(var(--foreground))" };
  return { bg: "hsl(var(--grey-600))", text: "hsl(var(--foreground))" };
}
