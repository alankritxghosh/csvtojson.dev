import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { LicenseToken } from '@/types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.LICENSE_SECRET) {
  throw new Error('LICENSE_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const LICENSE_SECRET = process.env.LICENSE_SECRET;

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      // Add any metadata you need
    },
  });

  return session;
}

/**
 * Generate a license token (JWT) after successful payment
 */
export function generateLicenseToken(customerId: string, expiresInDays: number = 365): string {
  const expires = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  
  const payload: LicenseToken = {
    tier: 'paid',
    expires,
  };

  const token = jwt.sign(payload, LICENSE_SECRET, {
    expiresIn: `${expiresInDays}d`,
    issuer: 'csvtojson.dev',
    subject: customerId,
  });

  return token;
}

/**
 * Verify and decode a license token
 */
export function verifyLicenseToken(token: string): LicenseToken | null {
  try {
    const decoded = jwt.verify(token, LICENSE_SECRET, {
      issuer: 'csvtojson.dev',
    }) as LicenseToken;

    // Check if token is expired
    if (decoded.expires < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Handle Stripe webhook (for subscription updates, cancellations, etc.)
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  return event;
}

