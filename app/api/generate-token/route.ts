import { NextRequest, NextResponse } from 'next/server';
import { generateLicenseToken } from '@/lib/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify the checkout session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Invalid or unpaid session' },
        { status: 400 }
      );
    }

    // Generate license token
    const customerId = session.customer as string || sessionId;
    const licenseToken = generateLicenseToken(customerId, 365);

    return NextResponse.json({ token: licenseToken });
  } catch (error: any) {
    // Log error without sensitive data (no tokens, no session IDs in error object)
    console.error('Token generation error:', {
      name: error?.name,
      message: error?.message?.split('\n')[0], // Only first line, no stack trace
    });
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}

