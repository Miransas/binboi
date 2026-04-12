"use client";

import useSWR from "swr";

import { fetchControlPlane, type ControlPlaneRequest } from "@/lib/controlplane";

type UseRequestsOptions = {
  kind?: "REQUEST" | "WEBHOOK";
};

function buildRequestsPath(options?: UseRequestsOptions) {
  const params = new URLSearchParams();
  if (options?.kind) {
    params.set("kind", options.kind);
  }

  const query = params.toString();
  return query ? `/api/v1/requests?${query}` : "/api/v1/requests";
}

export function useRequests(options?: UseRequestsOptions) {
  const path = buildRequestsPath(options);
  const { data, error, mutate } = useSWR(path, (requestPath: string) =>
    fetchControlPlane<ControlPlaneRequest[]>(requestPath), {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  });

  return {
    requests: (Array.isArray(data) ? data : []) as ControlPlaneRequest[],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
