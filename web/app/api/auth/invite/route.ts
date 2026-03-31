import { NextResponse } from "next/server";

import { createInvite, AuthRouteError } from "@/lib/auth-system";
import { getCurrentSession } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in to create invites.", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const invite = await createInvite({
      email: String(body.email ?? ""),
      invitedByUserId: session.user.id,
    });
    const previewUrl = new URL(`/invite/${encodeURIComponent(invite.inviteToken)}`, request.url).toString();

    return NextResponse.json({
      ok: true,
      email: invite.email,
      expiresAt: invite.expiresAt,
      delivery: {
        mode: "preview",
        previewUrl,
      },
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not create the invite." },
      { status: 500 },
    );
  }
}
