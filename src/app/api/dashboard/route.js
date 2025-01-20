import { NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0/edge";

export async function GET(req) {
  const res = NextResponse.next();
  try {
    const { accessToken } = await getAccessToken(req, res, {
      audience: process.env.AUTH0_AUDIENCE,
    });
    return NextResponse.json({ accessToken });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
