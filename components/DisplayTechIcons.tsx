import React from 'react'
import {cn, getTechLogos} from "@/lib/utils";
import Image from "next/image";

const DisplayTechIcons = async ({techStack}: TechIconProps) => {
    const techStackIcons = await getTechLogos(techStack);
    return (
        <div className="flex flex-row">
            {techStackIcons.slice(0, 3).map(({tech, url}, index) => {
                return <div key={url}
                            className={cn("relative group bg-dark-300 rounded-full p-2 flex-center", index >= 1 && "-ml-3")}>
                    <span className="tech-tooltip">{tech}</span>
                    <Image alt={tech} src={url} width={100} height={100} className="size-5"/>
                </div>
            })}
        </div>
    )
}
export default DisplayTechIcons
