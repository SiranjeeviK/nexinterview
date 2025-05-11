import React from 'react'
import {getCurrentUser} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";
import {getFeedbackByInterviewId, getInterviewsById} from "@/lib/actions/general.action";
import Image from "next/image";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const Page = async ({params}: RouteParams) => {
    const {id: interviewId} = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    const interview = await getInterviewsById(interviewId);

    if (!interview) {
        redirect('/');
    }

    const feedback = await getFeedbackByInterviewId({
        userId: user.id,
        interviewId: interviewId,
    })

    if (!feedback) {
        redirect('/');
    }

    console.log("Interview", interview, "Feedback", feedback)

    const formattedDate = dayjs(feedback.createdAt).format('MMM D, YYYY - h:mm A');


    return (
        <section className="section-feedback">
            {/*Title*/}
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -
                    <span
                        className="capitalize">{interview.role} Interview</span>
                </h1>
            </div>

            {/*Score and Date*/}
            <div className="flex flex-row justify-center">
                <div className="flex flex-row gap-5">
                    {/*Feedback Score Star*/}
                    <div className="flex flex-row gap-2 items-center">
                        <Image alt="star logo" src="/star.svg" width={22} height={22}/>
                        <p>
                            Overall Impression:{" "}
                            <span className="font-bold text-primary-200">
                                    {feedback.totalScore}
                            </span>/100
                        </p>
                    </div>

                    {/*Calendar Logo and Date*/}
                    <div className="flex flex-row gap-2 items-center">
                        <Image alt="calendar logo" src="/calendar.svg" width={22} height={22}/>
                        <p>{formattedDate}</p>
                    </div>
                </div>
            </div>

            <hr/>

            <p>{feedback.finalAssessment}</p>

            <div className="flex flex-col gap-4">
                <h2>Breakdown of the Interview: </h2>
                {feedback.categoryScores.map((category, index) => (
                    <div key={index}>
                        <p className="font-bold">{index + 1}. {category.name} ({category.score}/100)</p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>


            <div className="flex flex-col gap-3">
                <h3>Strengths</h3>
                <ul>
                    {feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>

            </div>

            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback.areasForImprovement.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>


            <div className="buttons">
                <Button className="btn-secondary">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">Back to dashboard</p>
                    </Link>
                </Button>

                <Button className="btn-primary">
                    <Link href={`/interview/${interviewId}`} className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-center text-secondary">Retake Interview</p>
                    </Link>
                </Button>
            </div>
        </section>
    )
}
export default Page
