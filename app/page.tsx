'use client';

import { useState, useCallback, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ConversionOptions from '@/components/ConversionOptions';
import JsonOutput from '@/components/JsonOutput';
import LimitBanner from '@/components/LimitBanner';
import UpgradeCTA from '@/components/UpgradeCTA';
import { ConversionOptions as ConversionOptionsType, ConversionResponse } from '@/types';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ConversionOptionsType>({
    hasHeader: true,
    inferTypes: true,
    emptyAsNull: true,
    prettyPrint: true,
  });
  const [json, setJson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState<number | undefined>();
  const [fileSize, setFileSize] = useState<number | undefined>();
  const [tier, setTier] = useState<'free' | 'paid'>('free');

  // Check for license key in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const licenseKey = localStorage.getItem('licenseKey');
      if (licenseKey && licenseKey.trim().length > 0) {
        // For MVP: Simple check - if license key exists, set tier to paid
        // No JWT parsing needed - license keys come from LemonSqueezy
        setTier('paid');
      }
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setFileSize(selectedFile.size);
    setJson(null);
    setError(null);
  }, []);

  // Map backend error codes to user-friendly messages
  const getErrorMessage = (data: ConversionResponse): string => {
    const errorCode = data.errorCode;
    const error = data.error || 'An error occurred';

    // If we have a specific error code, provide contextual messages
    switch (errorCode) {
      case 'FILE_TOO_LARGE':
        const maxMB = data.maxFileSize ? (data.maxFileSize / 1024 / 1024).toFixed(0) : 'unknown';
        return `File is too large. Maximum allowed size is ${maxMB}MB.`;
      case 'ROW_LIMIT_EXCEEDED':
        const maxRows = data.maxRows?.toLocaleString() || 'unknown';
        return `Too many rows. Maximum allowed is ${maxRows} rows.`;
      case 'COLUMN_LIMIT_EXCEEDED':
        const maxCols = data.maxColumns?.toLocaleString() || 'unknown';
        return `Too many columns. Maximum allowed is ${maxCols} columns.`;
      case 'INVALID_CSV':
        return 'Invalid CSV format. Please check your file and try again.';
      case 'TIMEOUT_EXCEEDED':
        return 'Processing took too long. Please try with a smaller file.';
      case 'INVALID_FILE_TYPE':
        return 'Invalid file type. Please upload a CSV file.';
      case 'NO_FILE_PROVIDED':
        return 'No file provided. Please select a CSV file.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate limit exceeded. Please try again later.';
      default:
        // Fall back to server-provided error message
        return error;
    }
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setJson(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hasHeader', String(options.hasHeader));
      formData.append('inferTypes', String(options.inferTypes));
      formData.append('emptyAsNull', String(options.emptyAsNull));
      formData.append('prettyPrint', String(options.prettyPrint));

      // Add license key if available
      if (typeof window !== 'undefined') {
        const licenseKey = localStorage.getItem('licenseKey');
        if (licenseKey) {
          formData.append('licenseKey', licenseKey);
        }
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data: ConversionResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = getErrorMessage(data);
        setError(errorMessage);
        return;
      }

      setJson(data.json || JSON.stringify(data.data));
      setRowCount(data.rowCount);
      setFileSize(data.fileSize);
    } catch (err: any) {
      // Network errors or other exceptions
      setError(err.message || 'An error occurred during conversion. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [file, options]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CSV to JSON Converter</h1>
            <nav className="flex gap-4">
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Convert CSV to JSON in Seconds
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Free, fast, and secure CSV to JSON conversion. No signup required. No data retention.
          </p>
        </div>

        {/* Converter Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
            
            {file && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleConvert}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Convert
                  </button>
                </div>
              </div>
            )}

            <ConversionOptions options={options} onChange={setOptions} />
            <LimitBanner
              fileSize={fileSize}
              rowCount={rowCount}
              tier={tier}
              onUpgrade={() => window.location.href = '/pricing'}
            />
          </div>

          <div>
            <JsonOutput json={json} error={error} loading={loading} />
          </div>
        </div>

        {/* What is CSV to JSON Section */}
        <section className="mb-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is CSV to JSON Conversion?</h2>
          <p className="text-gray-700 mb-4">
            CSV to JSON conversion transforms comma-separated values (CSV) files into JavaScript Object Notation (JSON) format. 
            CSV is a simple text format for tabular data, while JSON is a structured data format commonly used in web applications and APIs.
          </p>
          <p className="text-gray-700">
            This conversion is essential when you need to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>Import data into web applications that require JSON format</li>
            <li>Transform database exports for API consumption</li>
            <li>Prepare data for JavaScript/TypeScript applications</li>
            <li>Convert analytics exports for further processing</li>
          </ul>
        </section>

        {/* How Does This Work Section */}
        <section className="mb-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Does This Work?</h2>
          <p className="text-gray-700 mb-4">
            Our converter uploads your CSV file, parses it row by row, and converts each row into a JSON object. 
            You can choose to use the first row as headers, automatically infer data types (numbers, booleans), 
            and format the output as pretty-printed or minified JSON.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Key Features:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>No signup required:</strong> Start converting immediately</li>
            <li><strong>No data retention:</strong> Your files are processed in real-time and never stored</li>
            <li><strong>Automatic type inference:</strong> Converts numbers and booleans automatically</li>
            <li><strong>Header row support:</strong> Use your CSV headers as JSON keys</li>
            <li><strong>Fast processing:</strong> Handles large files efficiently with streaming</li>
          </ul>
        </section>

        {/* Example Preview */}
        <section className="mb-12 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Example Conversion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">CSV Input:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`name,age,email,active
John Doe,30,john@example.com,true
Jane Smith,25,jane@example.com,false`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">JSON Output:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "active": true
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com",
    "active": false
  }
]`}
              </pre>
            </div>
          </div>
        </section>

        {/* Upgrade CTA */}
        {tier === 'free' && (
          <div className="mb-12">
            <UpgradeCTA />
          </div>
        )}

        {/* FAQ Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
              <p className="text-gray-700">
                Yes. We do not store your files or data. The conversion happens in real-time and your data is never saved to our servers. 
                No signup is required, and we have no data retention policy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What are the file size limits?</h4>
              <p className="text-gray-700">
                Free tier supports files up to 5MB with 10,000 rows. Paid tier supports files up to 50MB with 1,000,000 rows. 
                All tiers have a hard limit of 100MB file size and 1,000 columns maximum.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I convert CSV with headers?</h4>
              <p className="text-gray-700">
                Yes. You can toggle the &quot;Header row&quot; option to use the first row of your CSV as JSON object keys. 
                If disabled, columns will be named column_1, column_2, etc.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What data types are automatically inferred?</h4>
              <p className="text-gray-700">
                When type inference is enabled, the converter automatically detects numbers (integers and decimals, including scientific notation), 
                boolean values (true/false), and empty strings (can be converted to null). All other values remain as strings.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} CSV to JSON Converter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

