'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';
import useSWR from 'swr';

export const useSession = () => {
  const { data: session, status, update } = useNextAuthSession();
  const { data: swrData, error, mutate } = useSWR(
    status === 'authenticated' ? '/api/user' : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch user data');
      return res.json();
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    session: {
      ...session,
      user: session?.user ? {
        ...session.user,
        ...swrData
      } : null
    },
    isLoading: status === 'loading',
    isError: error,
    mutate
  };
}; 