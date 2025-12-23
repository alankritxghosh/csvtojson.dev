'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  // LemonSqueezy redirects with license_key in query params
  const licenseKey = searchParams.get('license_key') || searchParams.get('licenseKey');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (licenseKey && typeof window !== 'undefined') {
      // Store license key in localStorage
      localStorage.setItem('licenseKey', licenseKey);
      setSaved(true);
    }
  }, [licenseKey]);

  const handleCopy = async () => {
    if (!licenseKey) return;
    
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            CSV to JSON Converter
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          {licenseKey ? (
            <>
              {saved && (
                <p className="text-gray-600 mb-8">
                  Thank you for subscribing. Your license key has been saved to your browser.
                </p>
              )}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your License Key</h2>
                <p className="text-sm text-gray-600 mb-4">
                  This license key has been automatically saved to your browser. You can also copy it manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-gray-300 rounded px-4 py-2 text-sm font-mono break-all">
                    {licenseKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-8">
              Thank you for subscribing! If you have a license key, please add it to your account settings.
            </p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Your license key is automatically saved in your browser</li>
              <li>• You can now convert larger CSV files (up to 50MB, 1M rows)</li>
              <li>• The license key will be sent automatically with each conversion request</li>
              <li>• Your subscription is active for 1 year</li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Start Converting
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

