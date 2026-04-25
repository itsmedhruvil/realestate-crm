"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { appRoles } from "@/lib/auth/roles";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  revenue?: string;
  joinedDate?: string;
}

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, "id" | "joinedDate">) => Promise<void>;
  member?: TeamMember | null;
}

export default function AddTeamMemberModal({ isOpen, onClose, onSave, member }: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
    revenue?: string;
  }>({
    name: "",
    role: "Sales Agent",
    email: "",
    phone: "",
    revenue: "",
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role || "Sales Agent",
        email: member.email || "",
        phone: member.phone || "",
        revenue: member.revenue || "",
      });
    } else {
      setFormData({
        name: "",
        role: "Sales Agent",
        email: "",
        phone: "",
        revenue: "",
      });
    }
  }, [member, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      toast.error("Name and role are required");
      return;
    }

    if (!member && !formData.email) {
      toast.error("Email is required to create a login invite");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      setFormData({
        name: "",
        role: "Sales Agent",
        email: "",
        phone: "",
        revenue: "",
      });
      toast.success(member ? "Team member updated successfully" : "Team member added successfully");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : member ? "Failed to update team member" : "Failed to add team member");
      console.error("Failed to save team member:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background rounded-xl border border-border p-6 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg hover:bg-muted/50 p-2 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <h3 className="text-lg font-semibold text-foreground mb-4">{member ? "Edit Team Member" : "Add Team Member"}</h3>

        <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="pl-10 pr-4 py-2 border border-border rounded-lg w-full focus:outline-none focus:border-foreground bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                name="role"
                value={formData.role}
                onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                className="pl-10 pr-4 py-2 border border-border rounded-lg w-full focus:outline-none focus:border-foreground bg-background text-foreground"
                required
              >
                {appRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="pl-10 pr-4 py-2 border border-border rounded-lg w-full focus:outline-none focus:border-foreground bg-background text-foreground"
                required={!member}
              />
            </div>
            {!member && (
              <p className="text-xs leading-5 text-muted-foreground">
                A Supabase password setup invite will be sent to this email.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="pl-10 pr-4 py-2 border border-border rounded-lg w-full focus:outline-none focus:border-foreground bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Revenue</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                placeholder="45 L"
                className="pl-10 pr-4 py-2 border border-border rounded-lg w-full focus:outline-none focus:border-foreground bg-background text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (member ? "Saving..." : "Adding...") : member ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
