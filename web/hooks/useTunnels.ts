"use client";

import useSWR from "swr";

import {
  buildControlPlaneProxyUrl,
  type ControlPlaneTunnel,
} from "@/lib/controlplane";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Tunnel request failed with ${res.status}`);
  }
  return res.json();
};

export function useTunnels() {
  const { data, error, mutate } = useSWR(
    buildControlPlaneProxyUrl("/api/tunnels"),
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: false },
  );

  return {
    tunnels: (Array.isArray(data) ? data : []) as ControlPlaneTunnel[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
