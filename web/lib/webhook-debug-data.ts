import type { ControlPlaneRequest } from "@/lib/controlplane";
import type { AssistantContext } from "@/lib/assistant-types";

export type WebhookDeliveryStatus = "SUCCESS" | "FAILED" | "RETRYING";

export type WebhookDeliveryRecord = {
  id: string;
  provider: string;
  eventType: string;
  method: string;
  path: string;
  status: number;
  deliveryStatus: WebhookDeliveryStatus;
  destination: string;
  receivedAt: string;
  durationMs: number;
  retries: number;
  errorClassification?: string;
  tunnelId: string;
  source: string;
  requestPreview: string;
  payloadPreview: string;
  responsePreview: string;
  signatureHeader?: string;
  responseHeaders: string[];
};

export const previewWebhookDeliveryRecords: WebhookDeliveryRecord[] = [
  {
    id: "wh_01h-stripe-signature",
    provider: "Stripe",
    eventType: "payment_intent.succeeded",
    method: "POST",
    path: "/api/webhooks/stripe",
    status: 500,
    deliveryStatus: "FAILED",
    destination: "localhost:3000 -> Next.js route handler",
    receivedAt: "2026-03-31T09:18:12.000Z",
    durationMs: 842,
    retries: 2,
    errorClassification: "SIGNATURE_MISMATCH",
    tunnelId: "tun_stripe_dev_01",
    source: "Dashboard live delivery stream",
    requestPreview:
      "POST /api/webhooks/stripe with stripe-signature, livemode=false, payment_intent id pi_3Q...",
    payloadPreview:
      '{ "id": "evt_3Q...", "type": "payment_intent.succeeded", "data": { "object": { "id": "pi_3Q..." } } }',
    responsePreview:
      'Error: No signatures found matching the expected signature for payload. Route returned 500 with body "Webhook signature verification failed".',
    signatureHeader: "stripe-signature",
    responseHeaders: ["content-type: text/plain", "cache-control: no-store"],
  },
  {
    id: "wh_01h-clerk-auth",
    provider: "Clerk",
    eventType: "user.created",
    method: "POST",
    path: "/api/webhooks/clerk",
    status: 401,
    deliveryStatus: "FAILED",
    destination: "localhost:3000 -> App Router webhook endpoint",
    receivedAt: "2026-03-31T09:12:41.000Z",
    durationMs: 221,
    retries: 1,
    errorClassification: "AUTH_HEADER_REJECTED",
    tunnelId: "tun_auth_dev_07",
    source: "Dashboard live delivery stream",
    requestPreview:
      "POST /api/webhooks/clerk with svix-id, svix-signature, and svix-timestamp headers.",
    payloadPreview:
      '{ "type": "user.created", "data": { "id": "user_2r...", "email_addresses": ["dev@example.com"] } }',
    responsePreview:
      'Response body preview: "Unauthorized". Local middleware rejected the request before the handler verified the svix signature.',
    signatureHeader: "svix-signature",
    responseHeaders: ["x-middleware-rewrite: /login", "content-type: text/plain"],
  },
  {
    id: "wh_01h-supabase-success",
    provider: "Supabase",
    eventType: "auth.user.created",
    method: "POST",
    path: "/api/webhooks/supabase",
    status: 200,
    deliveryStatus: "SUCCESS",
    destination: "localhost:3000 -> Express webhook consumer",
    receivedAt: "2026-03-31T09:06:18.000Z",
    durationMs: 118,
    retries: 0,
    tunnelId: "tun_auth_dev_07",
    source: "Dashboard live delivery stream",
    requestPreview: "POST /api/webhooks/supabase with x-supabase-signature and auth payload.",
    payloadPreview:
      '{ "type": "auth.user.created", "record": { "id": "1e4...", "email": "new@example.com" } }',
    responsePreview: 'Response body preview: "ok". Delivery reached the local consumer and returned 200.',
    signatureHeader: "x-supabase-signature",
    responseHeaders: ["content-type: text/plain"],
  },
  {
    id: "wh_01h-github-route",
    provider: "GitHub",
    eventType: "push",
    method: "POST",
    path: "/api/github/webhook",
    status: 404,
    deliveryStatus: "FAILED",
    destination: "localhost:3000 -> Next.js app",
    receivedAt: "2026-03-31T08:58:03.000Z",
    durationMs: 74,
    retries: 3,
    errorClassification: "ROUTE_NOT_FOUND",
    tunnelId: "tun_github_hooks_02",
    source: "Dashboard replay model",
    requestPreview: "POST /api/github/webhook with x-github-event=push and x-hub-signature-256.",
    payloadPreview:
      '{ "ref": "refs/heads/main", "repository": { "full_name": "acme/api" }, "pusher": { "name": "binboi-dev" } }',
    responsePreview:
      'Response body preview: "Not Found". The public request succeeded, but the local route path does not exist at /api/github/webhook.',
    signatureHeader: "x-hub-signature-256",
    responseHeaders: ["content-type: text/plain", "x-powered-by: Next.js"],
  },
  {
    id: "wh_01h-linear-retry",
    provider: "Linear",
    eventType: "Issue",
    method: "POST",
    path: "/api/webhooks/linear",
    status: 502,
    deliveryStatus: "RETRYING",
    destination: "localhost:3000 -> background worker ingress",
    receivedAt: "2026-03-31T08:51:11.000Z",
    durationMs: 1650,
    retries: 4,
    errorClassification: "UPSTREAM_502",
    tunnelId: "tun_linear_ops_03",
    source: "Dashboard replay model",
    requestPreview:
      "POST /api/webhooks/linear with linear-signature and issue payload after provider retry.",
    payloadPreview:
      '{ "action": "create", "type": "Issue", "data": { "id": "LIN-204", "title": "Broken webhook flow" } }',
    responsePreview:
      'Response body preview: "Bad Gateway". The local worker dependency timed out, so Binboi marked the delivery as retrying.',
    signatureHeader: "linear-signature",
    responseHeaders: ["content-type: text/plain", "retry-after: 30"],
  },
  {
    id: "wh_01h-neon-success",
    provider: "Neon",
    eventType: "branch.created",
    method: "POST",
    path: "/api/webhooks/neon",
    status: 202,
    deliveryStatus: "SUCCESS",
    destination: "localhost:8080 -> Go webhook handler",
    receivedAt: "2026-03-31T08:44:35.000Z",
    durationMs: 144,
    retries: 0,
    tunnelId: "tun_data_lab_08",
    source: "Dashboard replay model",
    requestPreview: "POST /api/webhooks/neon with branch metadata and project id.",
    payloadPreview:
      '{ "type": "branch.created", "data": { "branch_id": "br-prod-copy", "project_id": "proj_123" } }',
    responsePreview: 'Response body preview: "queued". The local handler accepted and queued the event.',
    responseHeaders: ["content-type: application/json"],
  },
  {
    id: "wh_01h-stripe-paymentfailed",
    provider: "Stripe",
    eventType: "invoice.payment_failed",
    method: "POST",
    path: "/api/webhooks/stripe",
    status: 200,
    deliveryStatus: "SUCCESS",
    destination: "localhost:3000 -> Next.js route handler",
    receivedAt: "2026-03-31T08:38:20.000Z",
    durationMs: 132,
    retries: 0,
    tunnelId: "tun_stripe_dev_01",
    source: "Dashboard replay model",
    requestPreview: "POST /api/webhooks/stripe with retry_count=0 and invoice.payment_failed.",
    payloadPreview:
      '{ "type": "invoice.payment_failed", "data": { "object": { "customer": "cus_42", "attempt_count": 1 } } }',
    responsePreview: 'Response body preview: "{\\"received\\":true}". Delivery was acknowledged successfully.',
    signatureHeader: "stripe-signature",
    responseHeaders: ["content-type: application/json"],
  },
  {
    id: "wh_01h-supabase-schema",
    provider: "Supabase",
    eventType: "storage.object.created",
    method: "POST",
    path: "/api/webhooks/storage",
    status: 422,
    deliveryStatus: "FAILED",
    destination: "localhost:3000 -> Zod-validated route",
    receivedAt: "2026-03-31T08:31:05.000Z",
    durationMs: 195,
    retries: 1,
    errorClassification: "PAYLOAD_SCHEMA_REJECTED",
    tunnelId: "tun_storage_lab_04",
    source: "Dashboard replay model",
    requestPreview: "POST /api/webhooks/storage with object metadata and bucket info.",
    payloadPreview:
      '{ "type": "storage.object.created", "record": { "bucket_id": "avatars", "name": "2026/03/binboi.png" } }',
    responsePreview:
      'Response body preview: "Expected mimeType to be present". The handler ran and rejected the payload shape.',
    responseHeaders: ["content-type: application/json"],
  },
  {
    id: "wh_01h-github-success",
    provider: "GitHub",
    eventType: "installation_repositories",
    method: "POST",
    path: "/api/webhooks/github",
    status: 202,
    deliveryStatus: "SUCCESS",
    destination: "localhost:3000 -> queue-backed route",
    receivedAt: "2026-03-31T08:24:26.000Z",
    durationMs: 98,
    retries: 0,
    tunnelId: "tun_github_hooks_02",
    source: "Dashboard replay model",
    requestPreview: "POST /api/webhooks/github with x-github-event=installation_repositories.",
    payloadPreview:
      '{ "action": "added", "repositories_added": [{ "full_name": "acme/binboi" }] }',
    responsePreview: 'Response body preview: "accepted". GitHub delivery reached the queue-backed consumer.',
    signatureHeader: "x-hub-signature-256",
    responseHeaders: ["content-type: application/json"],
  },
  {
    id: "wh_01h-clerk-middleware",
    provider: "Clerk",
    eventType: "session.ended",
    method: "POST",
    path: "/api/webhooks/clerk",
    status: 500,
    deliveryStatus: "FAILED",
    destination: "localhost:3000 -> middleware protected route",
    receivedAt: "2026-03-31T08:19:42.000Z",
    durationMs: 488,
    retries: 2,
    errorClassification: "MIDDLEWARE_SHORT_CIRCUIT",
    tunnelId: "tun_auth_dev_07",
    source: "Dashboard replay model",
    requestPreview:
      "POST /api/webhooks/clerk with svix headers and session.ended event payload.",
    payloadPreview:
      '{ "type": "session.ended", "data": { "id": "sess_2x...", "status": "ended" } }',
    responsePreview:
      'Response body preview: "Cannot read properties of undefined". The route ran, but middleware setup caused the handler to fail before returning a valid response.',
    signatureHeader: "svix-signature",
    responseHeaders: ["content-type: text/plain"],
  },
];

export const webhookDeliveryRecords = previewWebhookDeliveryRecords;

function inferProviderFromPath(path: string) {
  const lower = path.toLowerCase();
  if (lower.includes("stripe")) {
    return "Stripe";
  }
  if (lower.includes("clerk")) {
    return "Clerk";
  }
  if (lower.includes("supabase")) {
    return "Supabase";
  }
  if (lower.includes("github")) {
    return "GitHub";
  }
  if (lower.includes("linear")) {
    return "Linear";
  }
  if (lower.includes("neon")) {
    return "Neon";
  }
  return "Webhook";
}

function inferSignatureHeader(
  provider: string,
  requestHeaders: string[] | undefined,
) {
  const knownHeader = requestHeaders?.find((header) => {
    const lower = header.toLowerCase();
    return (
      lower.startsWith("stripe-signature:") ||
      lower.startsWith("svix-signature:") ||
      lower.startsWith("x-supabase-signature:") ||
      lower.startsWith("x-hub-signature-256:") ||
      lower.startsWith("linear-signature:")
    );
  });

  if (knownHeader) {
    return knownHeader.split(":")[0]?.trim().toLowerCase();
  }

  switch (provider) {
    case "Stripe":
      return "stripe-signature";
    case "Clerk":
      return "svix-signature";
    case "Supabase":
      return "x-supabase-signature";
    case "GitHub":
      return "x-hub-signature-256";
    case "Linear":
      return "linear-signature";
    default:
      return undefined;
  }
}

function inferDeliveryStatus(record: ControlPlaneRequest): WebhookDeliveryStatus {
  if (record.status < 400) {
    return "SUCCESS";
  }

  const classification = `${record.error_type || ""} ${record.response_preview || ""}`.toUpperCase();
  if (
    record.status === 502 ||
    record.status === 503 ||
    record.status === 504 ||
    classification.includes("TIMEOUT") ||
    classification.includes("BAD_GATEWAY") ||
    classification.includes("SERVICE_UNAVAILABLE")
  ) {
    return "RETRYING";
  }

  return "FAILED";
}

function estimateRetries(status: WebhookDeliveryStatus, record: ControlPlaneRequest) {
  if (status === "RETRYING") {
    return 1;
  }
  if (status === "FAILED" && record.status >= 500) {
    return 1;
  }
  return 0;
}

export function buildWebhookDeliveryRecordsFromRequests(
  requests: ControlPlaneRequest[],
): WebhookDeliveryRecord[] {
  return requests
    .filter((record) => (record.kind || "").toUpperCase() === "WEBHOOK")
    .map((record) => {
      const provider = record.provider || inferProviderFromPath(record.path || "");
      const deliveryStatus = inferDeliveryStatus(record);

      return {
        id: record.id,
        provider,
        eventType: record.event_type || "Unclassified event",
        method: record.method || "POST",
        path: record.path || "/",
        status: record.status,
        deliveryStatus,
        destination: record.destination || record.target || "Unknown destination",
        receivedAt: record.created_at,
        durationMs: record.duration_ms,
        retries: estimateRetries(deliveryStatus, record),
        errorClassification: record.error_type || undefined,
        tunnelId: record.tunnel_id,
        source: record.source || "Dashboard live delivery stream",
        requestPreview:
          record.request_preview || `${record.method || "POST"} ${record.path || "/"}`,
        payloadPreview: record.payload_preview || "No payload preview was captured.",
        responsePreview: record.response_preview || "No response preview was captured.",
        signatureHeader: inferSignatureHeader(provider, record.request_headers),
        responseHeaders: record.response_headers ?? [],
      } satisfies WebhookDeliveryRecord;
    })
    .sort(
      (left, right) =>
        new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime(),
    );
}

export function buildAssistantContextForDelivery(record: WebhookDeliveryRecord): AssistantContext {
  return {
    requestContext: {
      method: record.method,
      path: record.path,
      status: record.status,
      durationMs: record.durationMs,
      provider: record.provider,
      source: record.source,
      target: record.destination,
      destination: record.destination,
      errorType: record.errorClassification,
      requestPreview: record.requestPreview,
      responsePreview: record.responsePreview,
      tunnelId: record.tunnelId,
      timestamp: record.receivedAt,
      summary: `${record.provider} ${record.eventType} delivery returned ${record.status} after ${record.durationMs}ms.`,
    },
    webhookContext: {
      provider: record.provider,
      eventType: record.eventType,
      endpoint: record.path,
      deliveryStatus: record.deliveryStatus,
      signatureHeader: record.signatureHeader,
      retries: record.retries,
      latencyMs: record.durationMs,
      destination: record.destination,
      receivedAt: record.receivedAt,
      errorClassification: record.errorClassification,
      payloadPreview: record.payloadPreview,
      responsePreview: record.responsePreview,
      attemptId: record.id,
      summary: `${record.provider} ${record.eventType} delivery is currently ${record.deliveryStatus.toLowerCase()}.`,
    },
  };
}
