import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2L7IDiqi9roAadE1Urx7rZ9fk38UuOo8",
  authDomain: "prepmock-2ea3f.firebaseapp.com",
  projectId: "prepmock-2ea3f",
  storageBucket: "prepmock-2ea3f.firebasestorage.app",
  messagingSenderId: "528413526298",
  appId: "1:528413526298:web:e8ef3868c15449563bc4a3",
  measurementId: "G-B5EFHE92W6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider); // ✅ Works in browser
    const user = result.user;
    const idToken = await user.getIdToken();

    // Send idToken to your backend or store session
    return { success: true, user, idToken };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    return { success: false, message: error.message };
  }
};
export { signInWithGoogle };