# PropDesk — Real Estate CRM

A full-featured real estate CRM built with **Next.js 16**, **MongoDB + Mongoose**, **Clerk Auth**, **Tailwind CSS**, and **Recharts**. Features a dark-first UI with a sidebar layout, role-based access control, Kanban pipeline, calendar-based visit scheduling, payment tracking, and a unified global search.

## Features

| Module | Description |
|---|---|
| **Dashboard** | Revenue pipeline chart, lead overview, visit schedule, overdue payments |
| **Properties** | Listing management with status filters (Available / Reserved / Sold) |
| **Leads** | List + Kanban pipeline view, lead scoring, stage management |
| **Clients** | Client management with property interest tracking |
| **Site Visits** | Calendar view + daily schedule with visit scheduling |
| **Payments** | Payment reminders with overdue tracking, collection vs target chart |
| **Team** | Agent cards with conversion rates, performance bar chart |
| **Activity** | Activity feed + weekly trend + type breakdown charts |
| **Settings** | Admin-only settings panel for system configuration |
| **Search** | Global search across Properties, Leads, Clients, Team, Visits, and Payments |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB + Mongoose ODM
- **Auth**: Clerk (email/password, Google OAuth, magic links)
- **UI**: Tailwind CSS (dark-first, black/matt-grey palette)
- **Charts**: Recharts (AreaChart, BarChart, LineChart, PieChart, RadarChart)
- **Icons**: Lucide React
- **Font**: DM Sans (Google Fonts)
- **File Uploads**: Cloudinary (via next-cloudinary)
- **HTTP Client**: SWR (client-side data fetching with caching)
- **Notifications**: Sonner (toast notifications)
- **Theme**: Dark mode first — near-black (`#0a0a0a`) backgrounds with matt grey (`#2a2a2a`) borders

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/itsmedhruvil/realestate-crm.git
cd realestate-crm
npm install
```

### 2. Set Up MongoDB

Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and get your connection string.

### 3. Set Up Clerk Auth

1. Create an application at [clerk.com](https://clerk.com).
2. Navigate to **API Keys** to get your publishable and secret keys.
3. Configure your sign-in and sign-up URLs in the Clerk dashboard if needed.

### 4. Configure Environment Variables

Copy the following into your `.env.local` file:

```env
# MongoDB
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_SIGN_IN_URL="/signin"
CLERK_SIGN_UP_URL="/register"
CLERK_AFTER_SIGN_IN_URL="/dashboard"
CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Cloudinary (optional, for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/signin`.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables (from `.env.local`) in Vercel dashboard → **Settings → Environment Variables**.

Make sure your MongoDB Atlas cluster's IP whitelist includes `0.0.0.0/0` (allow all) for Vercel's serverless IPs, or configure [Vercel IP ranges](https://vercel.com/docs/concepts/network#serverless-functions-ip-ranges).

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar + topbar shell with RBAC
│   │   ├── page.tsx            # Dashboard overview (pipeline, KPI cards, charts, activity)
│   │   ├── properties/         # Property listings with status filters
│   │   ├── leads/              # Lead management + Kanban pipeline
│   │   ├── clients/            # Client management
│   │   ├── site-visits/        # Visit calendar + scheduler modal
│   │   ├── payments/           # Payment reminders with overdue tracking
│   │   ├── team/               # Team management with role scoping
│   │   ├── activities/         # Activity feed + trend charts
│   │   ├── account/            # User profile, security, notifications
│   │   └── settings/           # Admin-only system settings
│   ├── api/
│   │   ├── leads/route.ts
│   │   ├── properties/route.ts
│   │   ├── clients/route.ts
│   │   ├── visits/route.ts
│   │   ├── payments/route.ts
│   │   ├── team/route.ts
│   │   └── activities/route.ts
│   ├── layout.tsx              # Root layout with DM Sans + ClerkProvider + Toaster
│   ├── signin/page.tsx         # Sign-in page (Clerk)
│   ├── register/page.tsx       # Registration page (Clerk)
│   └── globals.css             # CSS variables + Tailwind base
├── lib/
│   ├── mongodb.ts              # Cached MongoDB / Mongoose connection
│   ├── models.ts               # Mongoose schemas (Lead, Property, Client, TeamMember, SiteVisit, Payment, Activity)
│   ├── providers.tsx           # ClerkProvider wrapper
│   ├── activityLogger.ts       # Activity logging utility
│   ├── utils.ts                # cn(), formatCurrency(), getInitials()
│   └── auth/
│       └── roles.ts            # RBAC: Administrator, Manager, Sales Agent
├── components/
│   ├── AuthForm.tsx            # Shared auth form component
│   ├── AddClientModal.tsx
│   └── AddTeamMemberModal.tsx
└── hooks/
    └── useData.ts              # SWR-based data fetching hook
```

## Role-Based Access Control (RBAC)

Three roles with scoped dashboard access:

| Role | Access |
|---|---|
| **Administrator** | Full access — all modules including Settings |
| **Manager** | All modules except Settings |
| **Sales Agent** | Dashboard, Properties, Leads, Clients, Activities, Site Visits, Account |

Roles are stored in Clerk user metadata (`unsafeMetadata.role`) and enforced on both the client-side sidebar and API routes.

## MongoDB Schemas

### Lead
| Field | Type | Description |
|---|---|---|
| `name` | String | Lead name |
| `email` | String | Contact email |
| `phone` | String | Phone number |
| `budget` | Number | Budget range |
| `interest` | String | Property interest type |
| `stage` | String | Pipeline stage (New, Contacted, Qualified, Negotiation, Closed Won, Closed Lost) |
| `score` | Number | Lead score (0–100) |
| `agent` | String | Assigned agent |
| `source` | String | Lead source (e.g., Website, Referral, Social Media) |
| `notes` | String | Internal notes |

### Property
| Field | Type | Description |
|---|---|---|
| `name` | String | Property name |
| `location` | String | Address / location |
| `price` | Number | Listing price |
| `type` | String | Property type (Apartment, Villa, Condo, Land, Commercial) |
| `status` | String | Status (Available, Reserved, Sold) |
| `beds` | Number | Bedrooms |
| `baths` | Number | Bathrooms |
| `sqft` | Number | Square footage |
| `agent` | String | Listing agent |
| `description` | String | Description |
| `images` | [String] | Image URLs |

### Client
| Field | Type | Description |
|---|---|---|
| `name` | String | Client name |
| `email` | String | Email address |
| `phone` | String | Phone number |
| `propertyInterest` | String | Type of property interested in |
| `budget` | String | Budget range |
| `status` | String | Status (Active, Inactive, Lead) |
| `notes` | String | Internal notes |

### TeamMember
| Field | Type | Description |
|---|---|---|
| `name` | String | Member name |
| `email` | String | Email address |
| `phone` | String | Phone number |
| `role` | String | Role (Sales Agent, Manager, Administrator) |
| `leads` | Number | Total leads handled |
| `closed` | Number | Closed deals |
| `revenue` | Number | Revenue generated |

### SiteVisit
| Field | Type | Description |
|---|---|---|
| `client` | String | Client name |
| `property` | String | Property name |
| `agent` | String | Assigned agent |
| `date` | String | Visit date (YYYY-MM-DD) |
| `time` | String | Visit time |
| `status` | String | Status (Scheduled, Completed, Cancelled, No Show) |
| `notes` | String | Visit notes |

### Payment
| Field | Type | Description |
|---|---|---|
| `client` | String | Client name |
| `property` | String | Property name |
| `amount` | Number | Payment amount |
| `type` | String | Type (EMI, Down Payment, Full Payment, Rent, Maintenance) |
| `dueDate` | String | Due date (YYYY-MM-DD) |
| `status` | String | Status (Pending, Collected, Overdue, Cancelled) |
| `reminderSent` | Boolean | Whether a reminder has been sent |

### Activity
| Field | Type | Description |
|---|---|---|
| `type` | String | Activity type (call, email, meeting, site_visit, note, deal, task) |
| `text` | String | Activity description |
| `agent` | String | Agent who performed the activity |
| `relatedLead` | String | Related lead ID |
| `relatedProperty` | String | Related property ID |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/leads` | List / create leads |
| PUT / DELETE | `/api/leads?id=...` | Update / delete lead |
| GET / POST | `/api/properties` | List / create properties |
| GET / POST | `/api/clients` | List / create clients |
| GET / POST | `/api/visits` | List / schedule site visits |
| GET / POST | `/api/payments` | List / add payments |
| GET / POST | `/api/team` | List / add team members |
| GET / POST | `/api/activities` | List / log activities |

Query parameters for filtering:
| Endpoint | Filter Examples |
|---|---|
| `/api/leads` | `?stage=Hot`, `?agent=John` |
| `/api/properties` | `?status=available`, `?type=Apartment` |
| `/api/clients` | `?status=Active` |
| `/api/visits` | `?date=2026-03-29`, `?agent=John` |
| `/api/payments` | `?status=overdue`, `?client=Jane` |

## Design System

- **Background**: `#0a0a0a` (near black)
- **Card**: `#111111`
- **Border**: `#2a2a2a` (matt grey)
- **Text**: `#f5f5f5` primary, `#a0a0a0` secondary, `#666` muted
- **Accent green**: `#4ade80` (sold / confirmed)
- **Accent amber**: `#fbbf24` (reserved / pending / warning)
- **Accent red**: `#f87171` (overdue / hot)
- **Accent blue**: `#60a5fa` (info / new)

## License

MIT