import { ConversionOptions } from '@/types';

export function inferType(value: string, options: ConversionOptions): any {
  // Handle empty strings
  if (options.emptyAsNull && value === '') {
    return null;
  }

  // Trim whitespace
  const trimmed = value.trim();
  if (trimmed === '') {
    return options.emptyAsNull ? null : '';
  }

  // Use Number() constructor - handles scientific notation (1e5), decimals, etc.
  // This is more robust than regex: handles "1e5", " 123 ", "-45.67", etc.
  const num = Number(trimmed);
  if (Number.isFinite(num) && !isNaN(num) && trimmed !== '') {
    // Convert to number if it's a valid numeric representation
    // Note: Number("") = 0, but we already handled empty strings above
    return num;
  }

  // Handle boolean values
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed === 'true') {
    return true;
  }
  if (lowerTrimmed === 'false') {
    return false;
  }

  // Default to string
  return value;
}

export function applyTypeInference(
  row: string[],
  options: ConversionOptions
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (let i = 0; i < row.length; i++) {
    const key = `column_${i + 1}`;
    result[key] = options.inferTypes ? inferType(row[i], options) : row[i];
  }
  
  return result;
}

export function applyTypeInferenceWithHeaders(
  row: string[],
  headers: string[],
  options: ConversionOptions
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (let i = 0; i < row.length; i++) {
    const key = headers[i] || `column_${i + 1}`;
    result[key] = options.inferTypes ? inferType(row[i], options) : row[i];
  }
  
  return result;
}

