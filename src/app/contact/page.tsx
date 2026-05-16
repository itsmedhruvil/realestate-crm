"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Send,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    interest: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          budget: form.budget,
          interest: form.interest,
          message: form.message,
          source: "Contact Page",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Failed to submit");
      }

      setSubmitted(true);
      toast.success("Inquiry submitted! Our team will reach out to you shortly.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                PropDesk
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
              Thank You!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Your inquiry has been received. Our team will review your requirements
              and get back to you within 24 hours. We look forward to helping you
              find the perfect property.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Building2 className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>

        <footer className="border-t border-border mt-12">
          <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PropDesk. All rights reserved.
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              PropDesk
            </Link>
            <Link
              href="/listings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16">
          {/* Left: Contact info */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Get in Touch
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-lg">
              Interested in buying, selling, or renting property? Fill out the form
              and our expert team will get back to you with the best options
              tailored to your needs.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground mt-0.5">hello@propdesk.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Office</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    123 Business Park, <br />
                    M.G. Road, Mumbai - 400001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Working Hours</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Mon - Sat: 9:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Send Us a Message
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us about your property needs and we'll find the perfect match.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Name <span className="text-foreground">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Email <span className="text-foreground">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Budget Range
                  </label>
                  <input
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    placeholder="₹45,00,000 - ₹1 Cr"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Property Interest
                </label>
                <input
                  value={form.interest}
                  onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
                  placeholder="e.g., 2BHK Apartment, Villa, Commercial Space"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your requirements, preferred location, timeline, etc."
                  rows={4}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? "Submitting..." : "Submit Inquiry"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy. Your information will be kept confidential.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PropDesk. All rights reserved.
        </div>
      </footer>
    </main>
  );
}