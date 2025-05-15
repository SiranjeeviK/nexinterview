'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { getGravatarUrl } from "@/lib/utils/gravatar";

export default function UserNavMenu({ user }: { user: { name: string; email: string; id: string } }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 rounded-full focus:ring-0 focus-visible:ring-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getGravatarUrl(user.email)} alt={user.name} onError={(e) => { (e.target as HTMLImageElement).src = "/user-avatar.svg"; }} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 dark:bg-dark-200">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium text-base">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
        <DropdownMenuItem disabled>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 