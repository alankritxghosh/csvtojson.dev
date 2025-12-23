import { NextRequest, NextResponse } from 'next/server';
// TOKEN GENERATION DISABLED - License keys come from LemonSqueezy, not generated server-side
// import { generateLicenseToken, isStripeConfigured, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Token generation endpoint is disabled - license keys come from LemonSqueezy
  return NextResponse.json(
    { error: 'Token generation is disabled. License keys are provided by LemonSqueezy after purchase.' },
    { status: 503 }
  );

  /* STRIPE TOKEN GENERATION CODE COMMENTED OUT - Keeping for reference
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not available' },
        { status: 503 }
      );
    }

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
  */
}

