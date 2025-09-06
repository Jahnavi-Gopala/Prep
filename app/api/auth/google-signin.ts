// import { NextResponse } from "next/server";
// import {  } from "@/lib/actions/auth.actions";

// export async function POST(req: Request) {
//   const { uid, name, email, idToken } = await req.json();
//   const result = await signInWithGoogle(uid, name, email, idToken);
//   return NextResponse.json(result);
// }

// import { NextResponse } from "next/server";

// export async function POST() {
//   try {
//     // Here you would integrate with Google OAuth logic
//     // Example: verify token, get user profile, save in DB, create session, etc.

//     // For demo purposes:
//     const user = {
//       id: "123",
//       name: "Test User",
//       email: "test@example.com"
//     };

//     return NextResponse.json({ user }, { status: 200 });
//   } catch (error) {
//     console.error("Google sign-in API error:", error);
//     return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
//   }
// }
