import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import React from "react";
import { getGravatarUrl } from "@/lib/utils/gravatar";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviews = (await getInterviewsByUserId(user.id))?.slice(0, 10) || [];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={getGravatarUrl(user.email, 160)} alt={user.name} />
          <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-100">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Separator className="my-6" />
      <div>
        <h3 className="text-lg font-semibold mb-4">Last 10 Interviews</h3>
        {interviews.length === 0 ? (
          <p className="text-muted-foreground">No interviews found.</p>
        ) : (
          <ul className="space-y-4">
            {interviews.map((interview) => (
              <li key={interview.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-dark-200 rounded-lg p-4">
                <div>
                  <span className="font-medium text-primary-100">{interview.role}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{dayjs(interview.createdAt).format('MMM D, YYYY')}</span>
                </div>
                <Link href={`/mock-interview/${interview.id}`} className="text-blue-400 hover:underline mt-2 md:mt-0">View</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Separator className="my-8" />
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button disabled variant="outline">Edit Profile</Button>
        <Button disabled variant="outline">Change Password</Button>
        <Button disabled variant="destructive">Delete Account</Button>
      </div>
    </div>
  );
} 