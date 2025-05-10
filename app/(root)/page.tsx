import {Button} from '@/components/ui/button'
import React from 'react'
import Link from "next/link";
import Image from "next/image";
import {dummyInterviews} from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import {getCurrentUser, getInterviewsByUserId, getLatestInterviews} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";

const page = async () => {

    const user = await getCurrentUser();

    if (!user?.id) {
        redirect('/sign-in');
    }

    // const userInterviews = await getInterviewsByUserId(user.id) ?? [];
    // const latestInterviews = await getLatestInterviews({userId: user.id})?? [];

    // Parallel data fetching
    const [userInterviews, latestInterviews] = await Promise.all([
        getInterviewsByUserId(user.id).then(res => res ?? []),
        getLatestInterviews({userId: user.id}).then(res => res ?? []),
    ])


    const hasPastInterviews = userInterviews?.length > 0;
    const hasLatestInterviews = userInterviews?.length > 0;

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>
                        Get Interview-Ready with AI-powered Mock Interview
                    </h2>

                    <p className="text-lg">
                        Practice on real interview questions & feedback
                    </p>

                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">
                            Start a interview
                        </Link>
                    </Button>
                </div>

                <Image alt="robo-dude" src="/robot.png" width={400} height={400} className="max-sm:hidden"/>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>

                <div className="interviews-section">
                    {hasPastInterviews ?
                        userInterviews.map((interview) => (
                            <InterviewCard {...interview} key={interview.id}/>
                        )) :
                        <p>You have&apos;t taken any interviews yet</p>
                    }
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>

                <div className="interviews-section">
                    {hasLatestInterviews ?
                        latestInterviews.map((interview) => (
                            <InterviewCard {...interview} key={interview.id}/>
                        )) : <p>There are no interviews available</p>}
                </div>
            </section>
        </>
    )
}

export default page