import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookieValue, SESSION_COOKIE } from "@/lib/auth";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  // If the site isn't configured with a passcode yet, don't lock everyone out.
  if (!secret || !process.env.SITE_PASSCODE) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionCookieValue(secret, cookie);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
