import React from 'react';

export function Select({ options = [], className = '', ...props }) {
  return (
    <select
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
