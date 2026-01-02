# AI-Powered Bike Marketplace

A modern bike marketplace platform built with Next.js, featuring AI-powered image analysis, test drive bookings, and admin management capabilities.

## Features

- 🤖 AI-powered bike image analysis using Google's Gemini
- 🔐 Secure authentication with Clerk
- 📸 Image storage using Supabase
- 🗄️ PostgreSQL database with Prisma ORM
- 📅 Test drive booking system
- 👩‍💼 Admin dashboard for bike management
- 🔍 Advanced bike search functionality
- 💾 Real-time data updates

## Tech Stack

- **Frontend**: Next.js 14
- **Authentication**: Clerk
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **AI**: Google Gemini API
- **Rate Limiting**: ArcJet
- **UI Components**: Tailwind CSS & Shadcn UI

## Prerequisites

- Node.js 18+ 
- PostgreSQL
- Supabase account
- Clerk account
- Google Gemini API key
- ArcJet API key

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

DATABASE_URL=your_supabase_db_url
DIRECT_URL=your_supabase_direct_url

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

ARCJET_KEY=your_arcjet_key
GEMINI_API_KEY=your_gemini_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai_bike_marketplace.git
```

2. Install dependencies:
```bash
npm install
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── actions/         # Server actions
├── app/            # Next.js app router pages
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configurations
├── prisma/         # Database schema and migrations
└── public/         # Static assets
```

## Key Features Explained

### AI Image Analysis
- Upload bike images for automatic detail extraction
- AI-powered bike identification and categorization
- Automated price suggestions

### Test Drive System
- Book test drives for available bikes
- Manage bookings through admin dashboard
- Automatic status updates

### Admin Dashboard
- Comprehensive bike management
- User management
- Test drive booking overview
- Analytics and reporting


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.


