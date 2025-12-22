import { Limits } from '@/types';
import { applyHardLimits } from './limits';

export class ValidationError extends Error {
  public readonly errorCode: string;
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.errorCode = errorCode;
  }
}

/**
 * Validate file size before parsing
 */
export function validateFileSize(fileSize: number, limits: Limits): void {
  const hardLimits = applyHardLimits(limits);
  
  if (fileSize > hardLimits.maxFileSize) {
    throw new ValidationError(
      `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(hardLimits.maxFileSize / 1024 / 1024).toFixed(2)}MB`,
      'FILE_TOO_LARGE'
    );
  }
}

/**
 * Validate file type is CSV
 */
export function validateFileType(file: File): void {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'application/csv',
  ];
  
  const validExtensions = ['.csv'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = validTypes.includes(file.type) || file.type === '';

  if (!hasValidExtension && !hasValidType) {
    throw new ValidationError(
      'Invalid file type. Please upload a CSV file.',
      'INVALID_FILE_TYPE'
    );
  }
}

/**
 * Pre-validate CSV structure (peek at first few bytes to check column count)
 * This is a best-effort check before full parsing
 */
export async function peekColumnCount(file: File, maxColumns: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const chunkSize = 1024; // Read first 1KB

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        const columnCount = firstLine.split(',').length;

        if (columnCount > maxColumns) {
          reject(
            new ValidationError(
              `CSV has ${columnCount} columns, maximum allowed is ${maxColumns}`,
              'COLUMN_LIMIT_EXCEEDED'
            )
          );
          return;
        }

        resolve();
      } catch (error) {
        // If peek fails, let the parser handle it
        resolve();
      }
    };

    reader.onerror = () => {
      // If peek fails, let the parser handle it
      resolve();
    };

    const blob = file.slice(0, chunkSize);
    reader.readAsText(blob);
  });
}

/**
 * Comprehensive file validation
 */
export async function validateFile(
  file: File,
  limits: Limits
): Promise<void> {
  // Validate file type
  validateFileType(file);

  // Validate file size
  validateFileSize(file.size, limits);

  // Peek at column count (best effort)
  const hardLimits = applyHardLimits(limits);
  await peekColumnCount(file, hardLimits.maxColumns);
}

