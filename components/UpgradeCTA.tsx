'use client';

import Link from 'next/link';

interface UpgradeCTAProps {
  reason?: string;
}

export default function UpgradeCTA({ reason }: UpgradeCTAProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-2">Need Higher Limits?</h3>
      {reason && <p className="text-blue-100 mb-4">{reason}</p>}
      <ul className="list-disc list-inside text-sm text-blue-100 mb-4 space-y-1">
        <li>Up to 50MB file size</li>
        <li>Up to 1,000,000 rows</li>
        <li>Faster processing</li>
        <li>Priority support</li>
      </ul>
      <Link
        href="/pricing"
        className="inline-block px-6 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
      >
        View Pricing
      </Link>
    </div>
  );
}

