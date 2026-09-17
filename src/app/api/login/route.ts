import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json().catch(() => ({ passcode: "" }));
  const expected = process.env.SITE_PASSCODE;
  const secret = process.env.SESSION_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { error: "Server is not configured. Set SITE_PASSCODE and SESSION_SECRET." },
      { status: 500 }
    );
  }

  if (typeof passcode !== "string" || passcode !== expected) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  const cookieValue = await createSessionCookieValue(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
