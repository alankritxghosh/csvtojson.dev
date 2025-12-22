import Papa from 'papaparse';
import { ConversionOptions, Limits } from '@/types';
import { applyTypeInference, applyTypeInferenceWithHeaders } from './type-inference';

export interface ParseResult {
  data: any[];
  headers?: string[];
  rowCount: number;
}

export class RowLimitExceededError extends Error {
  public readonly errorCode = 'ROW_LIMIT_EXCEEDED';
  constructor(public maxRows: number, public actualRows: number) {
    super(`Row limit exceeded: ${actualRows} rows found, maximum allowed is ${maxRows}`);
    this.name = 'RowLimitExceededError';
  }
}

export class ColumnLimitExceededError extends Error {
  public readonly errorCode = 'COLUMN_LIMIT_EXCEEDED';
  constructor(public maxColumns: number, public actualColumns: number) {
    super(`Column limit exceeded: ${actualColumns} columns found, maximum allowed is ${maxColumns}`);
    this.name = 'ColumnLimitExceededError';
  }
}

export class TimeoutExceededError extends Error {
  public readonly errorCode = 'TIMEOUT_EXCEEDED';
  constructor(public timeoutMs: number) {
    super(`Processing timeout: exceeded ${timeoutMs}ms`);
    this.name = 'TimeoutExceededError';
  }
}

/**
 * Parse CSV with row counting during parsing and early abort on limits
 * CRITICAL: Row counting happens DURING parsing, not after
 */
export async function parseCSV(
  file: File | string,
  options: ConversionOptions,
  limits: Limits
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    let headers: string[] | undefined;
    let rowCount = 0;
    let firstRow = true;
    let maxColumnsSeen = 0;
    let parserInstance: any = null;

    // Set up timeout guard
    const timeoutId = setTimeout(() => {
      if (parserInstance) {
        parserInstance.abort();
      }
      reject(new TimeoutExceededError(limits.processingTimeout));
    }, limits.processingTimeout);

    try {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        worker: false, // Run in main thread for better control
        step: (result, parser) => {
          // Store parser reference for timeout abort
          parserInstance = parser;

          // Check column count on first row
          if (firstRow) {
            const rowData = result.data as string[];
            const columnCount = rowData.length;
            maxColumnsSeen = columnCount;
            
            if (columnCount > limits.maxColumns) {
              clearTimeout(timeoutId);
              parser.abort();
              reject(new ColumnLimitExceededError(limits.maxColumns, columnCount));
              return;
            }

            // Extract headers if needed
            if (options.hasHeader) {
              headers = rowData;
              firstRow = false;
              // CRITICAL: Return early to skip header row from data AND rowCount
              // Header row must not be counted in rowCount when hasHeader === true
              return;
            }
            // If no header, fall through to process first row as data row
          }

          // Increment row count AFTER header row logic is resolved
          // This ensures deterministic counting: header row is never counted when hasHeader === true
          // Only data rows (non-header rows) increment the counter
          rowCount++;

          // CRITICAL: Abort immediately when row limit exceeded
          if (rowCount > limits.maxRows) {
            clearTimeout(timeoutId);
            parser.abort();
            reject(new RowLimitExceededError(limits.maxRows, rowCount));
            return;
          }

          // Track max columns
          const rowData = result.data as string[];
          const columnCount = rowData.length;
          if (columnCount > maxColumnsSeen) {
            maxColumnsSeen = columnCount;
            if (columnCount > limits.maxColumns) {
              clearTimeout(timeoutId);
              parser.abort();
              reject(new ColumnLimitExceededError(limits.maxColumns, columnCount));
              return;
            }
          }

          // Apply type inference
          const row = rowData;
          let processedRow: Record<string, any>;

          if (options.hasHeader && headers) {
            processedRow = applyTypeInferenceWithHeaders(row, headers, options);
          } else {
            processedRow = applyTypeInference(row, options);
          }

          data.push(processedRow);
          firstRow = false;
        },
        complete: () => {
          clearTimeout(timeoutId);
          resolve({
            data,
            headers,
            rowCount,
          });
        },
        error: (error) => {
          clearTimeout(timeoutId);
          // Sanitize error message to avoid exposing internal details
          const sanitizedMessage = error.message || 'Invalid CSV format';
          reject(new Error(`CSV parsing error: ${sanitizedMessage}`));
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

