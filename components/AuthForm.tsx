"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {Form, FormField} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/client"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { signIn, signInWithGoogle, signUp } from "@/lib/actions/auth.actions"

const authFormTypes = (type: FormType)=>{
    return z.object({
        name: type === "sign-up" ? z.string().min(3).max(50) : z.string().optional(),
        email: z.string().email(),
        password:  z.string().min(8), 
    })
}

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const formSchema = authFormTypes(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if (type === "sign-up") {
                const {name, email, password} = values;
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const result = await signUp({
                    name: name!,
                    email,
                    password,
                    uid:userCredential.user.uid
                })
                if (!result || !result.success) {
                    toast.error(result?.message || "Unknown error occurred.");
                    return;
                }
                toast.success("Account created successfully!");
                router.push('/sign-in');
                console.log("SIGN UP", values);
            }else{
                const {email, password} = values;
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken();
                if (!idToken) {
                    toast.error("Failed to get ID token. Please try again.");
                    return;
                }
                await signIn({email, idToken});
                toast.success("Signed in successfully!");
                router.push('/');
                console.log("SIGN IN", values);
            }
        }catch (error) {
            console.error("Error submitting form:", error);
            toast.error(`There was an error submitting the form: ${error}`);
        }
    }

    const isSignIn = type === "sign-in";
    // const isSignUp = type === "sign-up";

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" width={40} height={40} />
                    <h2 className="text-primary-100">PrepMock</h2>
                </div>
                <div className="flex flex-row gap-2 justify-center">
                    <h3>Practice job interview with AI</h3>
                </div>
{/*eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <div>
                                        <label htmlFor="name" className="block mb-1">Name</label>
                                        <Input id="name" placeholder="Your Name" {...field} />
                                    </div>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <div>
                                    <label htmlFor="email" className="block mb-1">Email</label>
                                    <Input id="email" type="email" placeholder="Your Email address" {...field} />
                                </div>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <div>
                                    <label htmlFor="password" className="block mb-1">Password</label>
                                    <Input id="password" type="password" placeholder="Your password" {...field} />
                                </div>
                            )}
                        />
                        <Button className="btn" type="submit">{isSignIn ? "Sign In" : "Create an Account"}</Button>
                        <p className="text-center text-light-100 mx-4">--------------------------Or--------------------------</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="btn w-full flex items-center justify-center gap-2"
                            onClick={signInWithGoogle}
                        >
                            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                            Continue with Google
                        </Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? "Don't have an account?" : "Already have an account?"}
                    <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
                        {!isSignIn ? "Sign in" : "Sign Up"}
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default AuthForm

