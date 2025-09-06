"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase/client"; // your firebase client config
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SignInButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Setup Google Provider
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      // Sign in with Popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || user.providerData[0]?.email;
      if (!email) throw new Error("No email returned from Google");

      localStorage.setItem("uid", user.uid);

      // Firestore: Check & create user if needed
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: email,
          createdAt: new Date().toISOString(),
        });
      }

      // Optional: Send to backend
    //   await fetch("/api/auth/google-signin", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ uid: user.uid, name: user.displayName, email }),
    //   });
    //     try {
    // const res = await fetch("/api/auth/google-signin", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //     uid: user.uid,
    //     name: user.displayName,
    //     email: user.email, // Make sure this is correct
    //     }),
    //     });
        
    //     const data = await res.json();
    //     console.log("Server response:", data);
        
    //     } catch (err) {
    //     console.error("Google sign-in error:", err);
    //     }

      toast.success("Signed in successfully!");
      router.push("/");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      toast.error(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
