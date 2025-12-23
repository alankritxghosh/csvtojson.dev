import { NextRequest, NextResponse } from 'next/server';
// STRIPE WEBHOOKS DISABLED - Replaced with LemonSqueezy
// import { handleStripeWebhook, isStripeConfigured } from '@/lib/stripe';
// import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Stripe webhooks are disabled - using LemonSqueezy instead
  return NextResponse.json(
    { error: 'Stripe webhooks are disabled. LemonSqueezy handles webhooks directly.' },
    { status: 503 }
  );

  /* STRIPE WEBHOOK CODE COMMENTED OUT - Keeping for reference
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe webhooks are not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = await handleStripeWebhook(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Payment successful - token generation happens on success page
        console.log('Checkout completed:', session.id);
        break;
      }
      case 'customer.subscription.deleted': {
        // Subscription cancelled - tokens will expire naturally
        console.log('Subscription cancelled:', event.data.object.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    // Log error without sensitive data (no request body, no tokens)
    console.error('Webhook error:', {
      name: error?.name,
      message: error?.message?.split('\n')[0], // Only first line, no stack trace
    });
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 400 }
    );
  }
  */
}

