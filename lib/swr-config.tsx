'use client';

import React from 'react';
import { SWRConfig } from 'swr';

export const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  onError: (err: Error) => {
    console.error('SWR Error:', err);
  },
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}