"use client";

import useSWR from 'swr';
import { buildApiUrl } from '@/lib/binboi';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Tunnel request failed with ${res.status}`);
  }
  return res.json();
};

export function useTunnels(userId?: string) {
  const { data, error, mutate } = useSWR(
    userId ? buildApiUrl(`/api/tunnels/${userId}`) : null,
    fetcher,
    { refreshInterval: userId ? 5000 : 0, revalidateOnFocus: false }
  );

  return {
    tunnels: Array.isArray(data) ? data : [],
    isLoading: Boolean(userId) && !error && !data,
    isError: error,
    refresh: mutate
  };
}
