'use server';

import {AuthErrorCodes} from "firebase/auth";
import {auth, db} from "@/firebase/admin";
import {cookies} from "next/headers";

export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params; // Not using the `password` sent?
    try {
        const userRecord = await db.collection("users").doc(uid).get();

        // User already exist
        if (userRecord.exists) {
            return {
                success: false,
                message: `User already exists. Please sign in instead.`,
            }
        }

        // No existing user, so create a new user
        await db.collection('users').doc(uid).set({
            name,
            email,
        })

        return {
            success: true,
            message: `Account created successfully.`,
        }

        // TODO: Remove below suppression comment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { // TODO: Replace `any` with another correct type
        console.error('Error creating user', e);

        if (e.code === AuthErrorCodes.EMAIL_EXISTS) {
            return {
                success: false,
                message: 'This email is already in use',
            }
        }

        return {
            success: false,
            message: 'Failed to create an account',
        }
    }
}

export async function signIn(params: SignInParams) {
    const {idToken, email} = params;

    try {
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            console.log('User does not exist');

            return {
                success: false,
                message: 'User does not exist. Create an account instead.',
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message: 'Logged in successfully.',
        }
    } catch (e) {
        console.error('Error signing in', e);

        return {
            success: false,
            message: 'Failed to sign into the account',
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000, // One week in milliseconds
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK, // One week in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    });
}


export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

        if (!userRecord.exists) {
            return null;
        }

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;

        // TODO: Remove below suppression comment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error('Error getting current user', e);

        if (e?.code === AuthErrorCodes.USER_DISABLED) {
            console.error('Error getting current user. User is DISABLED');
        }
        return null;
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();

    return !!user;
}
