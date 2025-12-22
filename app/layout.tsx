import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSV to JSON Converter - Free Online Tool',
  description: 'Convert CSV files to JSON instantly. No signup required. No data retention. Fast, secure, and free CSV to JSON conversion tool.',
  keywords: ['csv to json', 'csv converter', 'json converter', 'csv parser', 'data conversion'],
  openGraph: {
    title: 'CSV to JSON Converter - Free Online Tool',
    description: 'Convert CSV files to JSON instantly. No signup required. No data retention.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSV to JSON Converter - Free Online Tool',
    description: 'Convert CSV files to JSON instantly. No signup required.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is CSV to JSON conversion?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'CSV to JSON conversion transforms comma-separated values (CSV) files into JavaScript Object Notation (JSON) format. CSV is a simple text format for tabular data, while JSON is a structured data format commonly used in web applications and APIs.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does this CSV to JSON converter work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our converter uploads your CSV file, parses it row by row, and converts each row into a JSON object. You can choose to use the first row as headers, automatically infer data types (numbers, booleans), and format the output as pretty-printed or minified JSON. The conversion happens instantly in your browser - no data is stored on our servers.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is my data secure?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. We do not store your files or data. The conversion happens in real-time and your data is never saved to our servers. No signup is required, and we have no data retention policy.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are the file size limits?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Free tier supports files up to 5MB with 10,000 rows. Paid tier supports files up to 50MB with 1,000,000 rows. All tiers have a hard limit of 100MB file size and 1,000 columns maximum.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I convert CSV with headers?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. You can toggle the "Header row" option to use the first row of your CSV as JSON object keys. If disabled, columns will be named column_1, column_2, etc.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}

