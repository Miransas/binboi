"use client";

import useSWR from "swr";

import { fetchControlPlane, type ControlPlaneRequest } from "@/lib/controlplane";

export function useRequests() {
  const { data, error, mutate } = useSWR("/api/v1/requests", (path: string) =>
    fetchControlPlane<ControlPlaneRequest[]>(path), {
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
