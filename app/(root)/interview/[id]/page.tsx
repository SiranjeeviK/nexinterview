import React from 'react'
import {getInterviewsById} from "@/lib/actions/general.action";
import {redirect} from "next/navigation";
import Image from "next/image";
import {getRandomInterviewCover} from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/lib/actions/auth.action";

const Page = async ({params}: RouteParams) => {

    const {id} = await params;
    const interview = await getInterviewsById(id);
    const user = await getCurrentUser();

    if (!interview) {
        redirect('/');
    }

    return (
        <>
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        <Image alt="cover-image" src={getRandomInterviewCover()} width={40} height={40}
                               className="rounded-full object-cover size-[40px]"/>
                        <h3 className="capitalize">{interview.role}</h3>
                    </div>
                    <DisplayTechIcons techStack={interview.techstack}/>
                </div>

                <p className="bg-dark-200 px-4 py-2 rounded-full h-fit capitalize">{interview.type}</p>
            </div>

            <Agent type={"interview"} userName={user?.name ?? "You"} userId={user?.id} interviewId={interview.id}
                   questions={interview.questions}/>
        </>
    )
}
export default Page
