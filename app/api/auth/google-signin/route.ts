"use server";

import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { uid, name, email } = await req.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({ name, email });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google sign-in API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
