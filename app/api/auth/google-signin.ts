import { NextResponse } from "next/server";
import { signInWithGoogle } from "@/lib/actions/auth.actions";

export async function POST(req: Request) {
  const { uid, name, email, idToken } = await req.json();
  const result = await signInWithGoogle({ uid, name, email, idToken });
  return NextResponse.json(result);
}
