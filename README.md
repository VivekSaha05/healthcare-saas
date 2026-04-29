# SaaS Healthcare Platform

A full-stack healthcare SaaS web application built with Next.js 16, Firebase, and Resend. Patients can register, browse doctors, book appointments, and receive email confirmations. Admins manage doctors, appointments, and analytics from a dedicated dashboard.

---

## Live Demo

> Try the deployed version without setting anything up.

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin123 |

Sign in at `/login` with the admin credentials to explore the full admin dashboard — doctor management, appointment oversight, and analytics.

To test the patient flow, create a free account via `/signup`.

---

## Features

### Patient (User)
- Sign up / Sign in with Firebase Authentication
- Dashboard with activity overview and quick actions
- Browse verified doctors and book appointments (3-step flow: Doctor → Time → Confirm)
- View, reschedule, and cancel upcoming appointments
- Email confirmation sent to both patient and doctor on booking
- Profile management
- Free & Pro subscription tiers

### Admin
- Secure admin dashboard (role-based access via Firestore)
- Doctor management — add, edit, deactivate, delete doctors
- Appointment management — view all appointments, update statuses
- Analytics overview — total users, appointments, revenue metrics
- Only users with `role: "ADMIN"` in Firestore can access `/admin`

### General
- Landing page with hero, about, how-it-works, pricing, and contact sections
- Contact form with email delivery via Resend
- Emergency guidance page
- Help / FAQ, Privacy, Terms, Security, Status pages
- AI Voice Agent — coming soon placeholder
- Fully responsive (mobile + desktop)
- Dark/light theme support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Admin SDK | Firebase Admin (server-side) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Email | Resend + React Email |
| State / Data | TanStack Query v5 |
| Icons | Lucide React |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Linting | Biome |

---

## Project Structure

```
src/
├── app/
│   ├── admin/             # Admin dashboard (role-protected)
│   ├── appointments/      # Booking flow + upcoming appointments
│   ├── dashboard/         # User dashboard
│   ├── pro/               # Subscription plans
│   ├── profile/           # User profile
│   ├── voice/             # AI Agent (coming soon)
│   ├── login/
│   ├── signup/
│   ├── contact/
│   ├── emergency/
│   ├── help/
│   ├── privacy/
│   ├── terms/
│   ├── security/
│   ├── status/
│   └── api/
│       ├── auth/session/           # Firebase session cookie endpoint
│       ├── send-appointment-email/ # Appointment confirmation email
│       └── send-contact-email/     # Contact form email
├── components/
│   ├── admin/             # DoctorsManagement, AppointmentsTable, Analytics
│   ├── appointments/      # Booking steps, confirmation modal, doctor cards
│   ├── dashboard/         # WelcomeSection, MainActions, ActivityOverview
│   ├── emails/            # React Email templates
│   ├── landing/           # Hero, About, HowItWorks, Pricing, Contact, Header, Footer
│   ├── ui/                # shadcn/ui component library
│   ├── Navbar.tsx
│   └── UserDropdown.tsx
├── hooks/                 # use-appointments, use-doctors (TanStack Query)
└── lib/
    ├── actions/           # Server actions — appointments, doctors, admin-analytics
    ├── auth-context.tsx   # Firebase Auth context + session management
    ├── firebase.ts        # Firebase client SDK init
    ├── firebase-admin.ts  # Firebase Admin SDK init
    ├── get-server-user.ts # Server-side session user resolver
    ├── resend.ts          # Resend lazy factory
    ├── types.ts           # Shared TypeScript types
    └── utils.ts           # Utility helpers, appointment types, time slots
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com) project with **Authentication** and **Firestore** enabled
- A [Resend](https://resend.com) account for transactional emails

### 1. Clone the repository

```bash
git clone https://github.com/your-username/saas-healthcare-platform.git
cd saas-healthcare-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Firebase Client SDK (public — from Firebase Console > Project Settings > Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (private — from your service account JSON)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Resend (from resend.com > API Keys)
RESEND_API_KEY=
```

### 4. Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project
2. **Authentication** → Sign-in method → Enable **Email/Password**
3. **Firestore Database** → Create database → Start in production mode
4. **Project Settings** → Your Apps → Add Web App → copy the config values into `.env.local`
5. **Project Settings** → Service Accounts → Generate new private key → copy `project_id`, `client_email`, and `private_key` into the `FIREBASE_*` env vars

### 5. Firestore index

Create this composite index in **Firestore Console → Indexes → Composite**:

| Collection | Field 1 | Field 2 | Query scope |
|---|---|---|---|
| `appointments` | `userId` (Ascending) | `date` (Ascending) | Collection |

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Setting Up an Admin Account

1. Sign up through the app at `/signup`
2. Open [Firebase Console](https://console.firebase.google.com) → **Firestore Database** → `users` collection
3. Find your user document (by UID or email)
4. Edit the document and set the `role` field to `"ADMIN"`
5. Sign out and sign back in — you will be redirected to `/admin`

---

## Email Setup (Resend)

The platform sends two types of transactional emails:

| Email | Trigger | Recipients |
|---|---|---|
| Appointment Confirmation | On booking confirmed | Patient + Doctor |
| Contact Form | On contact form submit | Admin |

**Important:** Resend's `onboarding@resend.dev` sender can only deliver to your Resend account's verified email address during development. To send emails to any address (patients, doctors) in production:

1. Add and verify your domain at [resend.com/domains](https://resend.com/domains)
2. Update the `from:` field in:
   - `src/app/api/send-appointment-email/route.ts`
   - `src/app/api/send-contact-email/route.ts`

---

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint with Biome
npm run format   # Auto-format with Biome
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID (server-side Admin SDK) |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key (include `\n` line breaks) |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |

---

## License

MIT — see [LICENSE](./LICENSE) for details.
