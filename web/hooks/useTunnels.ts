"use client";

import useSWR from 'swr';

// Fetcher: API Key ile veri çeker
const fetcher = (url: string, key: string) => 
  fetch(url, { headers: { "X-Binboi-Key": key } }).then(res => res.json());

export function useTunnels(apiKey: string) {
  const { data, error, mutate } = useSWR(
    apiKey ? [`http://localhost:8080/api/tunnels`, apiKey] : null,
    ([url, key]) => fetcher(url, key),
    { refreshInterval: 5000 } // Her 5 saniyede bir otomatik yenile!
  );

  return {
    tunnels: data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}