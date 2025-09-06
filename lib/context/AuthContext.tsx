"use client";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/firebase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
} | null;

interface AuthContextValue {
  user: AuthUser;
  isLoading: boolean;
  error: string | null;
  handleSignInWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || user.providerData[0]?.email;
      if (!email) throw new Error("No email returned from Google");

      // Save to Firestore if new
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: email,
          createdAt: new Date().toISOString(),
        });
      }
      toast.success("Signed in successfully!");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      toast.success("Logged out");
      router.push("/sign-in");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, handleSignInWithGoogle, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthContextProvider");
  return context;
};
