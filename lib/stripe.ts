// STRIPE CODE DISABLED - Replaced with LemonSqueezy
// Keeping commented code for reference

/*
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { LicenseToken } from '@/types';

// Make Stripe optional - only initialize if credentials are available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

// LICENSE_SECRET is required for token verification/generation
// Use a default for development if not set (not secure for production)
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'dev-secret-key-change-in-production';

export function isStripeConfigured(): boolean {
  return stripe !== null && !!process.env.STRIPE_SECRET_KEY;
}

export async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

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

export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  return event;
}

export function getStripe(): Stripe | null {
  return stripe;
}
*/

/**
 * Validate LemonSqueezy license key format
 * SECURITY: This validates format only - server-side verification should be added for production
 * 
 * LemonSqueezy license keys are typically:
 * - UUIDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * - Or alphanumeric strings with specific patterns
 * 
 * @param key - License key string from LemonSqueezy
 * @returns true if key format matches expected patterns, false otherwise
 */
export function validateLicenseKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  const trimmedKey = key.trim();
  
  // Basic sanity check: non-empty string
  if (trimmedKey.length === 0) {
    return false;
  }

  // Validate UUID format (most common LemonSqueezy license key format)
  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (32 hex chars, 4 hyphens)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmedKey)) {
    return true;
  }

  // Validate "ls_" prefix format (alternative LemonSqueezy format)
  // Format: ls_ followed by alphanumeric characters
  if (trimmedKey.startsWith('ls_') && trimmedKey.length > 3) {
    const suffix = trimmedKey.substring(3);
    // Allow alphanumeric and hyphens in suffix
    if (/^[a-zA-Z0-9-]+$/.test(suffix) && suffix.length >= 8) {
      return true;
    }
  }

  // Reject any other format - prevents arbitrary string bypass
  return false;
}

