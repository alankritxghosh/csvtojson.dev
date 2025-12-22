'use client';

import { useState } from 'react';
import Link from 'next/link';

const isStripeConfigured = () => {
  return !!(
    typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID)
  );
};

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stripeConfigured = isStripeConfigured();

  const handleCheckout = async (priceId: string) => {
    setError(null);
    
    if (!stripeConfigured) {
      setError('Payment processing is not currently available. Please check back later or contact support.');
      return;
    }
    
    if (!priceId) {
      setError('Price ID not configured. Please set up Stripe products first.');
      return;
    }

    setLoading(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, planType: 'subscription' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              CSV to JSON Converter
            </Link>
            <nav>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works for you
          </p>
        </div>

        {!stripeConfigured && (
          <div className="max-w-4xl mx-auto mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-yellow-500 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Payment Processing Unavailable</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Paid subscriptions are currently unavailable. The free tier is fully functional - you can convert files up to 5MB and 10,000 rows.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-500 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₹0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Up to 5MB file size</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Up to 10,000 rows</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">All conversion features</span>
              </li>
            </ul>
            <Link
              href="/"
              className="block w-full text-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Start Free
            </Link>
          </div>

          {/* Paid Tier - Annual (Highlighted) */}
          <div className={`rounded-lg border-2 p-8 relative ${stripeConfigured ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300 opacity-75'}`}>
            {stripeConfigured && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                Best Value
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro (Annual)</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₹1,749</span>
              <span className="text-gray-600">/year</span>
              <p className="text-sm text-gray-600 mt-1">(₹146/month)</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Up to 50MB file size</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Up to 1,000,000 rows</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Faster processing</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '')}
              disabled={loading !== null}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Subscribe (Annual)'}
            </button>
          </div>
        </div>

        {/* Monthly Option */}
        <div className="max-w-md mx-auto mt-8">
          <div className={`rounded-lg border p-8 ${stripeConfigured ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-75'}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro (Monthly)</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₹449</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mb-6">Same features as annual plan, billed monthly</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '')}
              disabled={loading !== null || !stripeConfigured}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : stripeConfigured ? 'Subscribe (Monthly)' : 'Coming Soon'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Converter
          </Link>
        </div>
      </main>
    </div>
  );
}

