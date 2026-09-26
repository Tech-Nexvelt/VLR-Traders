# VLR Traders — B2B Industrial Product Platform

A modern, production-grade B2B web application and management platform built for **VLR Traders**, delivering a dynamic product catalog, category-driven browsing, WhatsApp deep-link lead generation, and a real-time admin management portal.

---

## 📌 Project Overview

VLR Traders is an enterprise-grade digital platform engineered to bridge industrial material buyers, interior contractors, and commercial builders with top-tier hardware, premium plywood, architectural boards, and security lock solutions. 

The application architecture follows a data-driven model where all public website branding, hero assets, product specifications, category hierarchies, and contact endpoints are managed dynamically via a central database.

---

## ✨ Features

### 🌐 Public Website
- **Dynamic Product Catalog**: Real-time DB-driven catalog with search, filtering by brand/category, and pagination.
- **Category-Driven Browsing**: Visual category cards populated dynamically with live cover images and product metrics.
- **Product Detail Pages**: Deep-dive product views featuring high-res galleries, technical specifications, and downloadable catalogue assets.
- **Instant WhatsApp Integration**: Automated wa.me deep-links with pre-filled lead inquiry context for rapid quotation response.
- **Lead Capture Forms**: Direct enquiry forms with state validation and CRM ingestion.
- **Adaptive Mobile Design**: Mobile-first responsive UI engineered for seamless browsing on viewports from 320px up to 4K displays.

### ⚙️ Admin Panel (CMS & CRM)
- **Catalog Management**: Full CRUD capabilities for products with automated category grouping and status toggles.
- **Category Management**: Category creation, image upload with file drag & drop, and real-time database sync.
- **Mini-CRM Lead Tracker**: Ingests, tracks, and manages customer enquiries across workflow stages (*New*, *Contacted*, *In Progress*, *Closed*).
- **Central Website Settings**: Single-source-of-truth admin control for business name, logo image, hero banner copy/photo, contact phones, WhatsApp routing, and SEO metadata.
- **Secure File Storage**: File drag & drop file uploader with MIME type verification and 5MB size limits.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Server & Client Components)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Tailwind CSS & Modern SaaS Vanilla CSS Design System
- **Database & ORM**: Supabase (PostgreSQL) integrated with Drizzle ORM
- **Object Storage**: Supabase Storage / Local Upload API
- **Icons**: Lucide React
- **Engineered by**: Nexvelt

---

## 📁 Project Structure

```text
e:\Websites\VLR
├── app/
│   ├── (public pages)
│   │   ├── about/              # About Us page
│   │   ├── catalog/            # Dynamic Product Catalog & Search
│   │   ├── contact/            # Contact Us & Location Details
│   │   ├── product/[slug]/     # Product Specification Details
│   │   ├── projects/           # Architectural Showcase Projects
│   │   └── page.tsx            # Dynamic Homepage
│   ├── admin/                  # Admin Management Portal
│   │   ├── catalog/            # Product & Category CRUD
│   │   ├── dashboard/          # Metrics & Analytics Dashboard
│   │   ├── leads/              # Lead Ingestion CRM
│   │   ├── projects/           # Project Portfolio Management
│   │   └── settings/           # Website & Enquiry Settings Control
│   ├── api/                    # Serverless API Endpoints
│   │   ├── admin/auth/         # Admin Authentication Routes
│   │   ├── categories/         # Categories REST API
│   │   ├── leads/              # Leads REST API
│   │   ├── products/           # Products REST API
│   │   ├── projects/           # Projects REST API
│   │   ├── settings/           # Global Settings API
│   │   └── upload/             # File Upload Handler
│   └── layout.tsx              # Root App Layout & Providers
├── components/
│   ├── enquiry/                # Enquiry Modals & Forms
│   ├── layout/                 # Sticky Header, Footer & Drawer
│   ├── providers/              # Website Settings Context Provider
│   └── ui/                     # Reusable Buttons, FABs & UI Elements
├── config/                     # Site Constants & Configurations
├── data/                       # Fallback & Mock Data Definitions
├── hooks/                      # Custom React Hooks (useWebsiteSettings)
├── lib/                        # Core Utilities & Data Stores
│   ├── db/                     # Drizzle Client & PostgreSQL Schema
│   ├── catalog.ts              # Catalog Search & Filter Engines
│   ├── categories-store.ts     # Category Database Services
│   ├── products-store.ts       # Product Database Services
│   ├── website-settings-store.ts # Central Settings Store
│   └── whatsapp.ts             # WhatsApp Link Generator
├── public/                     # Static Assets & Upload Directory
└── styles/                     # Global CSS, Design Tokens & Modules
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm
- Supabase account with Postgres database URL

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/nexvelt/vlr-traders.git
cd vlr-traders
npm install
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` in the root directory:

```bash
cp .env.example .env.local
```

Configure your environment keys in `.env.local`:

```env
# Database Connection (Supabase PostgreSQL Connection String)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Next.js Base Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Supabase Service Keys
PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

---

## 🗄️ Supabase & Database Setup

### 1. Push Database Schema
Execute Drizzle Kit to create the PostgreSQL tables in your database:

```bash
npm run db:push
```

### 2. Seed Initial Database Content (Optional)
Populate default categories, products, and global website settings:

```bash
npm run db:seed
```

---

## 💻 Running the Project

### Development Server
Run the Next.js local development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
Verify TypeScript compilation and generate the production build:

```bash
# Type-check
npx tsc --noEmit

# Production Build
npm run build

# Start Production Server
npm start
```

---

## ☁️ Deployment

### Deploy on Vercel (Recommended)
1. Push your code to GitHub / GitLab.
2. Import the repository into your Vercel Dashboard.
3. Add the `DATABASE_URL` environment variable under **Project Settings → Environment Variables**.
4. Set build command to `npm run build` and output directory to `.next`.
5. Click **Deploy**.

---

## 🔮 Future Improvements

- **Realtime Database Subscriptions**: Supabase Realtime channel integration for live order notification alerts in the admin panel.
- **PDF Catalog Generator**: Automated dynamic PDF generation for architectural quote proposals.
- **Multi-Tenant Roles**: Role-based access control (RBAC) for granular sales agent permissions.
- **Customer Portal**: Self-service portal for B2B buyers to reorder and review historical quotes.

---

## 🏢 Brand & Credits

Developed and maintained by **Nexvelt**.

- **Website**: [https://nexvelt.com](https://nexvelt.com)
- **Project**: VLR Traders B2B Platform
- **License**: Proprietary / Enterprise
