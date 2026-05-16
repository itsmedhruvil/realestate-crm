import mongoose, { Schema, Model } from "mongoose";

// ---- Lead ----
export interface ILead {
  _id?: string;
  createdAt?: Date;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  interest?: string;
  stage?: string;
  score?: number;
  urgency?: string;
  agent?: string;
  source?: string;
  notes?: string;
  relatedClientId?: string;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    budget: String,
    interest: String,
    stage: { type: String, default: "New" },
    score: { type: Number, default: 50 },
    urgency: { type: String, default: "Medium" },
    agent: String,
    source: String,
    notes: String,
    relatedClientId: { type: String, index: true },
  },
  { timestamps: true }
);

export const Lead: Model<ILead> =
  (mongoose.models.Lead as Model<ILead>) || mongoose.model<ILead>("Lead", LeadSchema);

// ---- Property ----
export interface IProperty {
  _id?: string;
  createdAt?: Date;
  name: string;
  location?: string;
  price?: string;
  type?: string;
  status?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  agent?: string;
  description?: string;
  images?: string[];
}

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true },
    location: String,
    price: String,
    type: String,
    status: { type: String, default: "available" },
    beds: Number,
    baths: Number,
    sqft: Number,
    agent: String,
    description: String,
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Property: Model<IProperty> =
  (mongoose.models.Property as Model<IProperty>) ||
  mongoose.model<IProperty>("Property", PropertySchema);

// ---- TeamMember ----
export interface ITeamMember {
  _id?: string;
  createdAt?: Date;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  leads?: number;
  closed?: number;
  revenue?: string;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    role: String,
    leads: { type: Number, default: 0 },
    closed: { type: Number, default: 0 },
    revenue: String,
  },
  { timestamps: true }
);

export const TeamMember: Model<ITeamMember> =
  (mongoose.models.TeamMember as Model<ITeamMember>) ||
  mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

// ---- SiteVisit ----
export interface ISiteVisit {
  _id?: string;
  createdAt?: Date;
  client?: string;
  property?: string;
  agent?: string;
  date?: Date;
  time?: string;
  status?: string;
  notes?: string;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    client: String,
    property: String,
    agent: String,
    date: Date,
    time: String,
    status: { type: String, default: "pending" },
    notes: String,
  },
  { timestamps: true }
);

export const SiteVisit: Model<ISiteVisit> =
  (mongoose.models.SiteVisit as Model<ISiteVisit>) ||
  mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);

// ---- Payment ----
export interface IPayment {
  _id?: string;
  createdAt?: Date;
  client?: string;
  property?: string;
  amount?: number;
  type?: string;
  dueDate?: Date;
  status?: string;
  reminderSent?: boolean;
}

const PaymentSchema = new Schema<IPayment>(
  {
    client: String,
    property: String,
    amount: Number,
    type: String,
    dueDate: Date,
    status: { type: String, default: "scheduled" },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

// ---- Client ----
export interface IClient {
  _id?: string;
  createdAt?: Date;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  propertyInterest?: string;
  status?: string;
  assignedAgent?: string;
  notes?: string;
  relatedLeadId?: string;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    budget: String,
    propertyInterest: String,
    status: { type: String, default: "Active" },
    assignedAgent: String,
    notes: String,
    relatedLeadId: { type: String, index: true },
  },
  { timestamps: true }
);

export const Client: Model<IClient> =
  (mongoose.models.Client as Model<IClient>) ||
  mongoose.model<IClient>("Client", ClientSchema);

// ---- Activity ----
export interface IActivity {
  _id?: string;
  createdAt?: Date;
  type?: string;
  text?: string;
  agent?: string;
  relatedLeadId?: string;
  relatedPropertyId?: string;
  relatedClientId?: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: String,
    text: String,
    agent: String,
    relatedLeadId: String,
    relatedPropertyId: String,
    relatedClientId: String,
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> =
  (mongoose.models.Activity as Model<IActivity>) ||
  mongoose.model<IActivity>("Activity", ActivitySchema);