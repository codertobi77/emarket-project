'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch account data');
  return res.json();
};

export const useAccount = () => {
  const { data, error, mutate } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  return {
    account: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}; 