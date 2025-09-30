import React from 'react';

export function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded hover:opacity-90 ${className} bg-indigo-600 text-white`}
    >
      {children}
    </button>
  );
}
