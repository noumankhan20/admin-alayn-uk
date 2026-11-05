# ALAYN Admin Portal

The central platform management console for the **ALAYN AI Operating System for Hospitality**. Exclusively built for Platform Administrators (`SUPER_ADMIN`) to manage businesses, subscriptions, outlets, platform users, and global analytics.

---

## 🚀 Features

- **🔐 Strict RBAC & Authentication**: Exclusively accessible by `SUPER_ADMIN` accounts.
- **🏢 Tenant & Business Management**: Overview, status toggling, and business detail drill-down.
- **💳 Subscription Plan Management**: Tier pricing, custom plan overrides, and billing tracking.
- **📍 Multi-Outlet Directory**: Cross-business visibility into all active locations and performance.
- **👥 Platform User Directory**: Global user lookup, role assignment, and access moderation.
- **📊 Real-time Platform Metrics**: Total businesses, active subscriptions, revenue analytics, and system audit logs.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **State & API**: [Redux Toolkit](https://redux-toolkit.js.org/) + RTK Query
- **Styling**: Tailwind CSS, Lucide React icons
- **Language**: TypeScript

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set `NEXT_PUBLIC_API_URL` to your backend API URL (default: `http://localhost:5000`).

### 3. Run Development Server
```bash
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔒 Access Control Note
This admin portal enforces strict access control. Only accounts with the `SUPER_ADMIN` role can log in and view dashboard data. Standard business owners, managers, and staff accounts are redirected to the restaurant frontend portal.
