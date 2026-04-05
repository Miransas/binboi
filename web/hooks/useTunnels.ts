"use client";

import useSWR from "swr";

import { fetchControlPlane, type ControlPlaneTunnel } from "@/lib/controlplane";

export function useTunnels() {
  const { data, error, mutate } = useSWR("/api/v1/tunnels", (path: string) =>
    fetchControlPlane<ControlPlaneTunnel[]>(path), {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  });

  return {
    tunnels: (Array.isArray(data) ? data : []) as ControlPlaneTunnel[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
