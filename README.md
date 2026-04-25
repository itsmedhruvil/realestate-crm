c# EstateOS — Real Estate CRM

A full-featured real estate CRM built with Next.js 14, Supabase (PostgreSQL), Prisma, Tailwind CSS, shadcn/ui, and Recharts. Dark mode, mobile responsive, Vercel-style minimal UI.

## Features

| Module | Description |
|---|---|
| **Dashboard** | Revenue pipeline charts, lead overview, visit schedule, overdue payments |
| **Properties** | Listing management with status filters (Available / Reserved / Sold) |
| **Leads** | List + Kanban pipeline view, lead scoring, stage management |
| **Site Visits** | Calendar view + daily schedule, visit scheduling modal |
| **Payments** | Payment reminders with overdue tracking, collection vs target chart |
| **Team** | Agent cards with conversion rates, performance bar chart |
| **Activity** | Activity feed + weekly trend + type breakdown charts |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts (AreaChart, BarChart, LineChart, PieChart, RadarChart)
- **Icons**: Lucide React
- **Font**: DM Sans (Google Fonts)
- **Theme**: Black/White with matt grey accents — dark mode first

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd estateos-crm
npm install
```

### 2. Set Up Supabase & Prisma

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to **Project Settings > Database** to get your connection string.
3. Ensure you have your `DATABASE_URL` (and `DIRECT_URL` if using connection pooling).
4. Push your schema to the database:
   ```bash
   npx prisma db push
   ```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase connection string and public auth key
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_or_publishable_key"
```

Use the Supabase anon or publishable key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Do not use a secret or service-role key in any `NEXT_PUBLIC_*` variable because
those values are shipped to the browser.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
# Add MONGODB_URI in Vercel dashboard → Settings → Environment Variables
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar + topbar shell
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── properties/         # Property listings
│   │   ├── leads/              # Lead management + kanban
│   │   ├── site-visits/        # Visit calendar + scheduler
│   │   ├── payments/           # Payment reminders
│   │   ├── team/               # Team management
│   │   └── activities/         # Activity log
│   ├── api/
│   │   ├── leads/route.ts
│   │   ├── properties/route.ts
│   │   ├── visits/route.ts
│   │   ├── payments/route.ts
│   │   ├── team/route.ts
│   │   └── activities/route.ts
│   ├── layout.tsx              # Root layout with DM Sans font
│   └── globals.css             # CSS variables + Tailwind base
├── lib/
│   ├── mongodb.ts              # MongoDB connection with caching
│   ├── models.ts               # Mongoose schemas (Lead, Property, TeamMember, SiteVisit, Payment, Activity)
│   └── utils.ts                # cn(), formatCurrency(), getInitials()
```

## MongoDB Schemas

### Lead
```typescript
{ name, email, phone, budget, interest, stage, score, agent, source, notes }
```

### Property
```typescript
{ name, location, price, type, status, beds, baths, sqft, agent, description, images }
```

### TeamMember
```typescript
{ name, email, phone, role, leads, closed, revenue }
```

### SiteVisit
```typescript
{ client, property, agent, date, time, status, notes }
```

### Payment
```typescript
{ client, property, amount, type, dueDate, status, reminderSent }
```

### Activity
```typescript
{ type, text, agent, relatedLead, relatedProperty }
```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List all leads (filter: `?stage=Hot`) |
| POST | `/api/leads` | Create new lead |
| GET | `/api/properties` | List properties (filter: `?status=available`) |
| POST | `/api/properties` | Add new property |
| GET | `/api/visits` | Get visits (filter: `?date=2026-03-29`) |
| POST | `/api/visits` | Schedule site visit |
| GET | `/api/payments` | Get payments (filter: `?status=overdue`) |
| POST | `/api/payments` | Add payment reminder |
| GET | `/api/team` | Get team members |
| POST | `/api/team` | Add team member |
| GET | `/api/activities` | Get activity log |
| POST | `/api/activities` | Log activity |

## Design System

- **Background**: `#0a0a0a` (near black)
- **Card**: `#111111`
- **Border**: `#2a2a2a` (matt grey)
- **Text**: `#f5f5f5` primary, `#a0a0a0` secondary, `#666` muted
- **Accent green**: `#4ade80` (sold/confirmed)
- **Accent amber**: `#fbbf24` (reserved/pending/warning)
- **Accent red**: `#f87171` (overdue/hot)
- **Accent blue**: `#60a5fa` (info/new)

## License
MIT
