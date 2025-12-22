'use client';

import { ConversionOptions } from '@/types';

interface ConversionOptionsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
}

export default function ConversionOptionsComponent({
  options,
  onChange,
}: ConversionOptionsProps) {
  const updateOption = (key: keyof ConversionOptions, value: boolean) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Conversion Options</h3>
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Header row (use first row as keys)
          </span>
          <input
            type="checkbox"
            checked={options.hasHeader}
            onChange={(e) => updateOption('hasHeader', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Infer data types (numbers, booleans)
          </span>
          <input
            type="checkbox"
            checked={options.inferTypes}
            onChange={(e) => updateOption('inferTypes', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Empty values as null
          </span>
          <input
            type="checkbox"
            checked={options.emptyAsNull}
            onChange={(e) => updateOption('emptyAsNull', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Pretty print JSON
          </span>
          <input
            type="checkbox"
            checked={options.prettyPrint}
            onChange={(e) => updateOption('prettyPrint', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
}

