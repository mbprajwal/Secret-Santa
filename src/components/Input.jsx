import React from 'react';

export default function Input({ label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                className={`px-4 py-2 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-santa-green focus:ring-green-100 hover:border-gray-300'
                    }
        `}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
