"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import Image from "next/image";
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";

import {auth} from "@/firebase/client";
import {signIn, signUp} from "@/lib/actions/auth.action";
import {AuthErrorCodes, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";

const authFormSchema = (type: FormType) => z.object({
    name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
})


const AuthForm = ({type}: { type: FormType }) => {
    const router = useRouter();
    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // TODO: Need to remove the below log
            console.log(type.toUpperCase(), values);
            if (type === "sign-up") {
                const {name, email, password} = values;

                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email: email,
                    password: password // Password is not even necessary to be sent here
                });

                if (!result?.success) {
                    toast.error(result?.message);
                    return;
                }

                toast.success("Account created successfully. Please sign in");
                router.push("/sign-in");
            } else if (type === "sign-in") {

                const {email, password} = values;

                const userCredentials = await signInWithEmailAndPassword(auth, email, password);

                const idToken = await userCredentials.user.getIdToken();

                if (!idToken) {
                    toast.error('Sign in failed');
                    return;
                }

                await signIn({
                    idToken, email
                });

                toast.success("Account created successfully");
                router.push("/");
            }
        } catch (error) {
            // Handling different Firebase auth errors
            if (typeof error === 'object' && error != null && 'code' in error) {
                switch (error.code) {
                    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
                        console.log("Invalid login credentials. Please try again");
                        toast.error("Invalid login credentials. Please try again");
                        break;
                    case AuthErrorCodes.INVALID_EMAIL:
                        console.error("Invalid email format. Please check your email.");
                        toast.error("Invalid email format. Please check your email.");
                        break;
                    case AuthErrorCodes.INVALID_PASSWORD:
                        console.error("Incorrect password. Please try again.");
                        toast.error("Invalid password. Please try again.");
                        break;
                    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
                        console.error("Too many failed login attempts. Please wait and try again later.");
                        toast.error("Too many failed login attempts. Please try again.");
                        break;
                    case AuthErrorCodes.EMAIL_EXISTS:
                        console.error('Email already exists. Please check your email or try to log in');
                        toast.error("Email already exists. Please check your email or try to log in.");
                        break;
                    default:
                        console.error("Authentication failed:", error);
                        toast.error(`Authentication failed: Something went wrong.`);
                }
            } else {
                console.error("Authentication failed:", error);
                toast.error(`Authentication failed: Something went wrong.`);
            }
        }
    }

    const isSignIn = type === "sign-in";

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100">NexInterview</h2>
                </div>
                <h3>Practice job interviews with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4 form">
                        {!isSignIn &&
                            <FormField
                                control={form.control}
                                name='name'
                                label='Name'
                                placeholder="Your Name"
                            />
                        }
                        <FormField
                            control={form.control}
                            name='email'
                            label='Email'
                            placeholder="Your email address"
                            type='email'
                        />
                        <FormField
                            control={form.control}
                            name='password'
                            label='Password'
                            placeholder="Enter your Password"
                            type='password'
                        />

                        <Button type="submit" className="btn">{isSignIn ? "Sign in" : "Create an Account"}</Button>
                    </form>
                </Form>

                <p className="text-center">{isSignIn ? "No Account yet?" : "Have an account already?"}
                    <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
                        {!isSignIn ? "Sign in" : "Create Account"}
                    </Link>
                </p>
            </div>
        </div>
    )
}
export default AuthForm