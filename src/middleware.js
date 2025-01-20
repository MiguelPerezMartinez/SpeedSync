// middleware.ts
import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0/edge";

export async function middleware(req) {
  // We only want to check/redirect if the user is visiting "/"
  if (req.nextUrl.pathname === "/") {
    // Create a mutable response so Auth0 can read/write cookies
    const res = NextResponse.next();

    // Check for an active Auth0 session
    const session = await getSession(req, res);
    if (session) {
      // User is logged in, redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Otherwise, let them continue to /
    return res;
  }

  // For all other paths, just continue
  return NextResponse.next();
}

// Limit this middleware to run only on the homepage
export const config = {
  matcher: ["/"],
};
