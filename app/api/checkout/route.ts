import { NextRequest, NextResponse } from 'next/server';
// STRIPE CHECKOUT DISABLED - Replaced with LemonSqueezy
// import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Stripe checkout is disabled - using LemonSqueezy hosted checkout instead
  return NextResponse.json(
    { error: 'Stripe checkout is disabled. Please use LemonSqueezy checkout links.' },
    { status: 503 }
  );

  /* STRIPE CODE COMMENTED OUT - Keeping for reference
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const { priceId, planType } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;

    const session = await createCheckoutSession(priceId, successUrl, cancelUrl);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    // Log error without sensitive data (no request body, no tokens)
    console.error('Checkout error:', {
      name: error?.name,
      message: error?.message?.split('\n')[0], // Only first line, no stack trace
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
  */
}

