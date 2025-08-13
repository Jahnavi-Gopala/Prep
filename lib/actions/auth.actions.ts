'use server';
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect,signInWithPopup } from "firebase/auth";
import { auth as clientAuth } from "@/firebase/client"; 
import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { toast } from "sonner";
// import router from "next/router";
// Only import client-side Firebase Auth in client-side code, not here

export  async function signUp( params: SignUpParams){
    const {uid, name, email} = params;
    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please Sign in instead.'
            }
        }
        await db.collection('users').doc(uid).set({
            name,
            email
        });

        return {
            success: true,
            message: 'User signed up successfully.'
        }

    }catch(error){
        console.error('Error during sign up:', error);

        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'Email already exists. Please use a different email.'
            }
        }
        return {
            success: false,
            message: 'An error occurred during sign up. Please try again later.'
        }
    }
}

export  async function signIn(params: SignInParams){
    const {email, idToken} = params;
    try{
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: 'User not found. Please sign up first.'
            }
        }
        await setSessionCookie(idToken);
        return {
            success: true,
            message: 'Sign-in successful.',
            uid: userRecord.uid,
            };
    }catch(error){
        console.error('Error during sign in:', error);
        return {
            success: false,
            message: 'An error occurred during sign in. Please try again later.'
        }
    }
}

export async function setSessionCookie(idToken:string) {
    const cookieStore  = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, { 
        expiresIn: 60 * 60 * 24 * 7 * 1000 
    }); // 7 days

    cookieStore.set('session', sessionCookie, {
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Ensure clientAuth is the client-side Firebase Auth instance
    const result = await signInWithPopup(clientAuth, provider);
    const user = result.user;

    const idToken = await user.getIdToken();
    const response = await signIn({
            email: user.email!,
            idToken,
        });
        toast.success("Signed in with Google!");
        if (!response.success) {
        toast.error(response.message || "Google sign-in failed.");
        return;
    }
    console.log("Google User:", user);
    return user;
  } catch (error) {
    console.error("Google Sign-In Error", error);
    throw error;
  }
};

// export const loginWithGoogle = async () => {
//     const provider = new GoogleAuthProvider();
//     signInWithRedirect(clientAuth, provider);
//     getRedirectResult(clientAuth)
//         .then((result) => {
//         const credential = GoogleAuthProvider.credentialFromResult(result);
//         const token = credential.accessToken;
//         const user = result.user;
//   }).catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         const email = error.customData.email;
//         const credential = GoogleAuthProvider.credentialFromError(error);
//   });
// }
export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(clientAuth, provider);
};

// Call this on page load (or inside a useEffect in React)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(clientAuth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential ? credential.accessToken : null;
      const user = result.user;
      console.log("User:", user);
      console.log("Access Token:", token);
    }
  } catch (error) {
    console.error("Error:");
  }
};


export async function getCurrentUser(): Promise<User | null>{
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();

        if (!userRecord.exists) return null;
        
        return {
            ...userRecord.data(),
            id: userRecord.id,
        }as User;
    } catch (error) {
        console.error('Error verifying session cookie:', error);
        return null;
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();
    return !!user;
}




