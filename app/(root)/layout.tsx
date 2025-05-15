import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated, getCurrentUser} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";
import UserNavMenu from "@/components/UserNavMenu";

const RootLayout = async ({children}: {
    children: React.ReactNode
}) => {

    const isUserAuthenticated = await isAuthenticated();
    const user = await getCurrentUser();

    if (!isUserAuthenticated || !user) {
        redirect('/sign-in');
    }

    return (
        <div className="root-layout">
            <nav className="flex items-center justify-between w-full">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="logo" width={38} height={32}/>
                    <h2 className="text-primary-100">NexInterview</h2>
                </Link>
                {/* Profile Avatar Dropdown */}
                <div className="flex items-center">
                  <UserNavMenu user={user} />
                </div>
            </nav>
            {children}
        </div>
    )
}
export default RootLayout
