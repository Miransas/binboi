import { buildApiUrl } from "@/lib/binboi";

export type ControlPlaneTunnel = {
  id: string;
  subdomain: string;
  target: string;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  region: string;
  request_count: number;
  bytes_out: number;
  created_at: string;
  last_connected_at?: string;
  public_url: string;
};

export type ControlPlaneTokenState = {
  token: string;
  last_used_at: string;
  active_nodes: number;
};

export type ControlPlaneDomain = {
  name: string;
  type: string;
  status: string;
  expected_txt: string;
  verified_at?: string;
};

export type ControlPlaneNode = {
  name: string;
  region: string;
  address: string;
  status: string;
  description: string;
};

export type ControlPlaneEvent = {
  level: string;
  message: string;
  tunnel_subdomain?: string;
  created_at: string;
};

export type ControlPlaneInstance = {
  instance_name: string;
  database: string;
  database_path: string;
  managed_domain: string;
  public_url_example: string;
  api_addr: string;
  tunnel_addr: string;
  proxy_addr: string;
  auth_mode: string;
  active_tunnels: number;
  reserved_tunnels: number;
};

export async function fetchControlPlane<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body?.error === "string" ? body.error : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
