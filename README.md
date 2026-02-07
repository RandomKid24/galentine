# Galentine's 2026 Celebration 🌸

A premium, elegant event registration platform designed for a magical Galentine's night. Features a high-end "Velvet Whispers & Gilded Grace" aesthetic with real-time seat tracking and automated email invitations.

## ✨ Key Features

- **Elegant UI**: Modern, responsive design with glassmorphism and smooth animations.
- **Dynamic Registration**: Real-time seat availability tracking for various ticket packages.
- **Smart Admin Panel**: Secure dashboard to manage registrations and event configuration.
- **Automated Invitations**: Unified SMTP integration for immediate email confirmations to guests.
- **Database Driven**: Powered by Supabase for reliable data storage and real-time updates.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Email**: Nodemailer (via SMTP)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- A Supabase project
- An SMTP provider (like Gmail with App Passwords)

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 🗄️ Database Setup

Run the contents of `database.sql` (found in the root) in your Supabase SQL Editor to set up the necessary tables and security policies.

## 🛡️ Security

The Admin panel is protected via session-based authentication. Configuration settings (like SMTP) are stored securely in the database and handled via server-side API routes.

---

*Made with love for the besties — Ananya & Co.*
