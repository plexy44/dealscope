
"use client";

import React from 'react';
// AuthProvider import removed

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // If you have multiple providers, nest them here.
  // AuthProvider removed
  return (
    <>
      {children}
    </>
  );
};

export default Providers;
