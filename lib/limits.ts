import { Limits } from '@/types';

// Free tier limits
export const FREE_TIER_LIMITS: Limits = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxRows: 10000,
  maxColumns: 1000,
  processingTimeout: 30000, // 30 seconds
};

// Paid tier limits
export const PAID_TIER_LIMITS: Limits = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxRows: 1000000,
  maxColumns: 1000,
  processingTimeout: 30000, // 30 seconds
};

// Hard absolute limits (applies to all tiers)
export const HARD_ABSOLUTE_LIMITS: Limits = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxRows: Infinity, // No hard limit on rows (tier-based)
  maxColumns: 1000, // Hard limit on columns
  processingTimeout: 30000, // 30 seconds
};

export function getLimitsForTier(tier: 'free' | 'paid'): Limits {
  return tier === 'paid' ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;
}

/**
 * Apply hard absolute limits to tier-based limits
 * SECURITY: This function ensures hard limits cannot be exceeded regardless of tier
 * Always called before processing to prevent bypass via headers or payload manipulation
 */
export function applyHardLimits(limits: Limits): Limits {
  return {
    maxFileSize: Math.min(limits.maxFileSize, HARD_ABSOLUTE_LIMITS.maxFileSize),
    maxRows: limits.maxRows,
    maxColumns: Math.min(limits.maxColumns, HARD_ABSOLUTE_LIMITS.maxColumns),
    processingTimeout: Math.min(limits.processingTimeout, HARD_ABSOLUTE_LIMITS.processingTimeout),
  };
}

