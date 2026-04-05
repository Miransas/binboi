# Control Plane Proxy Routes

This folder contains the Next.js proxy layer used to forward browser-safe requests to the Go control plane.

Use this route family when a client component needs tunnel, request, or domain data without talking to the Go API directly from the browser.
The proxy is intended to carry the stable `/api/v1/*` contract to the dashboard and assistant surfaces.

_Documentation maintained by Sardor Azimov._
