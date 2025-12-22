# CSV to JSON Converter

A production-grade, stateless micro-SaaS that converts CSV files to JSON format. Built with Next.js, TypeScript, and deployed on Vercel.

## Features

- **Fast CSV Parsing**: Streaming parser with row counting during parsing
- **Type Inference**: Automatic detection of numbers, booleans, and null values
- **No Data Storage**: Stateless design - files are processed in real-time
- **Free & Paid Tiers**: Free tier (5MB, 10K rows) and paid tier (50MB, 1M rows)
- **Token-Based Monetization**: Stripe Checkout integration with JWT license tokens

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **CSV Parsing**: PapaParse
- **Styling**: Tailwind CSS
- **Payment**: Stripe Checkout
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (for production)
- `LICENSE_SECRET`: Secret key for JWT token signing
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., https://csvtojson.dev)
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`: Stripe price ID for monthly subscription
- `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID`: Stripe price ID for annual subscription

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
csvtojson.dev/
├── app/
│   ├── api/              # API routes
│   ├── pricing/          # Pricing page
│   ├── success/          # Payment success page
│   ├── layout.tsx        # Root layout with SEO
│   └── page.tsx          # Main converter page
├── components/           # React components
├── lib/                  # Core logic (parsing, validation, etc.)
└── types/                # TypeScript definitions
```

## Key Implementation Details

### CSV Parsing
- Uses PapaParse with step callback for row-by-row processing
- Row counting happens during parsing (not after)
- Aborts immediately when limits are exceeded
- Handles edge cases: quoted fields, commas in values, escaped quotes

### Type Inference
- Deterministic rule-based inference (no AI)
- Uses `Number()` constructor for robust number detection
- Handles scientific notation, decimals, booleans, and null values

### Limits & Validation
- Free tier: 5MB, 10,000 rows
- Paid tier: 50MB, 1,000,000 rows
- Hard limits: 100MB file, 1,000 columns, 30s timeout (all tiers)

### Token Abuse Prevention
- Per-token rate limiting (100 requests/hour)
- Soft fingerprinting (hashed user-agent)
- Goal: Prevent infinite abuse, not perfect piracy prevention

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The project is configured for Vercel with:
- Node.js runtime for API routes
- 30-second timeout for conversion endpoint
- Automatic SSL and domain configuration

## License

Private - All rights reserved

