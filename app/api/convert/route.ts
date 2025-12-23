import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, RowLimitExceededError, ColumnLimitExceededError, TimeoutExceededError } from '@/lib/csv-parser';
import { validateFile, ValidationError } from '@/lib/validation';
import { getLimitsForTier, applyHardLimits } from '@/lib/limits';
import { validateLicenseKey } from '@/lib/stripe';
import { ConversionOptions } from '@/types';

// CRITICAL: MUST use Node runtime, NOT Edge
export const runtime = 'nodejs';

// Increase body size limit for file uploads
export const maxDuration = 30; // 30 seconds max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Explicitly define default values for ConversionOptions
    // Defaults ensure deterministic behavior when formData values are missing
    const hasHeaderRaw = formData.get('hasHeader');
    const inferTypesRaw = formData.get('inferTypes');
    const emptyAsNullRaw = formData.get('emptyAsNull');
    const prettyPrintRaw = formData.get('prettyPrint');
    
    const hasHeader = hasHeaderRaw === 'true';
    const inferTypes = inferTypesRaw === 'true';
    const emptyAsNull = emptyAsNullRaw === 'true';
    const prettyPrint = prettyPrintRaw === 'true';
    
    const licenseKey = formData.get('licenseKey') as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided',
          errorCode: 'NO_FILE_PROVIDED'
        },
        { status: 400 }
      );
    }

    // Determine tier based on license key
    let tier: 'free' | 'paid' = 'free';
    if (licenseKey) {
      // SECURITY: Validate license key format to prevent arbitrary string bypass
      // Format validation checks for UUID or "ls_" prefix patterns
      // NOTE: This is format validation only - server-side verification should be added for production
      if (validateLicenseKey(licenseKey)) {
        tier = 'paid';
      }
      // If license key format is invalid, tier remains 'free' (no error, just no upgrade)
    }

    // Get limits for tier
    // SECURITY: Limits are determined server-side from verified tier, not from client input
    // Hard limits are always applied to prevent bypass via headers or payload manipulation
    let limits = getLimitsForTier(tier);
    limits = applyHardLimits(limits); // Always apply hard limits - cannot be bypassed

    // Validate file (size, type, column count peek)
    try {
      await validateFile(file, limits);
    } catch (error: any) {
      const errorCode = error instanceof ValidationError ? error.errorCode : 'VALIDATION_ERROR';
      const errorMessage = error instanceof ValidationError 
        ? error.message 
        : 'File validation failed';
      
      // Extract context for specific error types
      const response: any = {
        success: false,
        error: errorMessage,
        errorCode,
      };
      
      if (errorCode === 'FILE_TOO_LARGE') {
        const hardLimits = applyHardLimits(limits);
        response.maxFileSize = hardLimits.maxFileSize;
        response.actualFileSize = file.size;
      }
      
      return NextResponse.json(response, { status: 400 });
    }

    // CRITICAL: Convert File to text string BEFORE parsing
    // PapaParse in Node.js needs string or stream, not File object
    // Converting once ensures deterministic parsing and prevents stream consumption issues
    const csvText = await file.text();

    // Parse CSV with options
    const options: ConversionOptions = {
      hasHeader,
      inferTypes,
      emptyAsNull,
      prettyPrint,
    };

    try {
      const result = await parseCSV(csvText, options, limits);

      // Generate JSON output
      let jsonOutput: string;
      if (prettyPrint) {
        jsonOutput = JSON.stringify(result.data, null, 2);
      } else {
        jsonOutput = JSON.stringify(result.data);
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        json: jsonOutput,
        rowCount: result.rowCount,
        fileSize: file.size,
        headers: result.headers,
      });
    } catch (error: any) {
      // Handle specific parsing errors with error codes
      if (error instanceof RowLimitExceededError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            errorCode: error.errorCode,
            rowCount: error.actualRows,
            maxRows: error.maxRows,
          },
          { status: 400 }
        );
      }

      if (error instanceof ColumnLimitExceededError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            errorCode: error.errorCode,
            columnCount: error.actualColumns,
            maxColumns: error.maxColumns,
          },
          { status: 400 }
        );
      }

      if (error instanceof TimeoutExceededError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            errorCode: error.errorCode,
            timeoutMs: error.timeoutMs,
          },
          { status: 408 }
        );
      }

      // Handle CSV parsing errors
      if (error.message && error.message.includes('CSV parsing error')) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message,
            errorCode: 'INVALID_CSV'
          },
          { status: 400 }
        );
      }

      // Generic error - sanitize message to avoid stack traces
      const sanitizedMessage = error.message && typeof error.message === 'string' 
        ? error.message.split('\n')[0] // Take only first line
        : 'An error occurred during processing';
      
      return NextResponse.json(
        { 
          success: false, 
          error: sanitizedMessage,
          errorCode: 'PROCESSING_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Log error without sensitive data (no file content, no tokens)
    console.error('Conversion error:', {
      name: error?.name,
      message: error?.message?.split('\n')[0], // Only first line, no stack trace
    });
    
    // Sanitize error message to avoid exposing stack traces
    const sanitizedMessage = error?.message && typeof error.message === 'string'
      ? error.message.split('\n')[0]
      : 'Internal server error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: sanitizedMessage,
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

