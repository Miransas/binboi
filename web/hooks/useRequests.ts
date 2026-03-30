"use client";

import useSWR from "swr";

import { buildApiUrl } from "@/lib/binboi";
import type { ControlPlaneRequest } from "@/lib/controlplane";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request inspection fetch failed with ${response.status}`);
  }
  return response.json();
};

export function useRequests() {
  const { data, error, mutate } = useSWR(buildApiUrl("/api/requests"), fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: false,
  });

  return {
    requests: (Array.isArray(data) ? data : []) as ControlPlaneRequest[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
