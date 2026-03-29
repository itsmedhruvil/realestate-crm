import mongoose, { Schema, model, models } from "mongoose";

// ─── Lead ───────────────────────────────────────────────
const LeadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  budget: String,
  interest: String,
  stage: { type: String, enum: ["New","Cold","Warm","Hot","Negotiating","Closed"], default: "New" },
  score: { type: Number, default: 50, min: 0, max: 100 },
  agent: String,
  source: String,
  notes: String,
}, { timestamps: true });

// ─── Property ───────────────────────────────────────────
const PropertySchema = new Schema({
  name: { type: String, required: true },
  location: String,
  price: String,
  type: String,
  status: { type: String, enum: ["available","reserved","sold"], default: "available" },
  beds: Number,
  baths: Number,
  sqft: Number,
  agent: String,
  description: String,
  images: [String],
}, { timestamps: true });

// ─── Team Member ────────────────────────────────────────
const TeamMemberSchema = new Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  role: String,
  leads: { type: Number, default: 0 },
  closed: { type: Number, default: 0 },
  revenue: String,
}, { timestamps: true });

// ─── Site Visit ─────────────────────────────────────────
const SiteVisitSchema = new Schema({
  client: String,
  property: String,
  agent: String,
  date: Date,
  time: String,
  status: { type: String, enum: ["pending","confirmed","completed","cancelled"], default: "pending" },
  notes: String,
}, { timestamps: true });

// ─── Payment ────────────────────────────────────────────
const PaymentSchema = new Schema({
  client: String,
  property: String,
  amount: Number,
  type: String,
  dueDate: Date,
  status: { type: String, enum: ["scheduled","upcoming","overdue","paid"], default: "scheduled" },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Activity ───────────────────────────────────────────
const ActivitySchema = new Schema({
  type: { type: String, enum: ["call","visit","note","deal","lead","payment","email"] },
  text: String,
  agent: String,
  relatedLead: { type: Schema.Types.ObjectId, ref: "Lead" },
  relatedProperty: { type: Schema.Types.ObjectId, ref: "Property" },
}, { timestamps: true });

export const Lead = models.Lead || model("Lead", LeadSchema);
export const Property = models.Property || model("Property", PropertySchema);
export const TeamMember = models.TeamMember || model("TeamMember", TeamMemberSchema);
export const SiteVisit = models.SiteVisit || model("SiteVisit", SiteVisitSchema);
export const Payment = models.Payment || model("Payment", PaymentSchema);
export const Activity = models.Activity || model("Activity", ActivitySchema);
