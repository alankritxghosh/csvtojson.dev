export interface ConversionOptions {
  hasHeader: boolean;
  inferTypes: boolean;
  emptyAsNull: boolean;
  prettyPrint: boolean;
}

export interface ConversionRequest extends ConversionOptions {
  file: File;
  licenseToken?: string;
}

export interface ConversionResponse {
  success: boolean;
  data?: any[];
  json?: string;
  error?: string;
  errorCode?: string;
  rowCount?: number;
  fileSize?: number;
  headers?: string[];
  maxRows?: number;
  maxColumns?: number;
  maxFileSize?: number;
  actualFileSize?: number;
  columnCount?: number;
  timeoutMs?: number;
}

export interface Limits {
  maxFileSize: number;
  maxRows: number;
  maxColumns: number;
  processingTimeout: number;
}

export interface LicenseToken {
  tier: 'free' | 'paid';
  expires: number;
}

export interface TokenAbuseCheck {
  allowed: boolean;
  reason?: string;
}

