"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useTraffic() {
  const { data, error } = useSWR('/api/stats', fetcher, {
    refreshInterval: 1000, // Her saniye tazele
  });

  return {
    stats: data,
    isLoading: !error && !data,
    isError: error
  };
}