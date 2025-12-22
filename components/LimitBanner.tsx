'use client';

import { FREE_TIER_LIMITS } from '@/lib/limits';

interface LimitBannerProps {
  fileSize?: number;
  rowCount?: number;
  tier: 'free' | 'paid';
  onUpgrade?: () => void;
}

export default function LimitBanner({
  fileSize,
  rowCount,
  tier,
  onUpgrade,
}: LimitBannerProps) {
  if (tier === 'paid') {
    return null; // Don't show limits for paid users
  }

  const limits = FREE_TIER_LIMITS;
  const fileSizeMB = fileSize ? (fileSize / 1024 / 1024).toFixed(2) : '0';
  const maxFileSizeMB = (limits.maxFileSize / 1024 / 1024).toFixed(0);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-blue-600 mt-0.5 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">Free Tier Limits</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              File size: {fileSizeMB}MB / {maxFileSizeMB}MB
            </p>
            {rowCount !== undefined && (
              <p className="mt-1">
                Rows: {rowCount.toLocaleString()} / {limits.maxRows.toLocaleString()}
              </p>
            )}
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Upgrade to unlock higher limits →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

