import React from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';

const InterviewCard = ({ interviewId, userId, role, type, techstack, createdAt }: InterviewCardProps) => {
    const feedback = null as Feedback | null;
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    return (
        <div className='card-border w-[360px] max-sm:w-full min-h-96'>
            <div className='card-interview'>
                <div>
                    <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600 '>
                        <p className='badge-text'>{normalizedType}</p>
                    </div>
                    <Image src={getRandomInterviewCover()} alt="Interview Cover" width={60} height={60} className='rounded-full object-fit size-[60px]' />
                    <h3 className='mt-5 capitialize'>
                        {role} Interview
                    </h3>

                    <div className='flex flex-row gap-5 mt-3'>
                        <div className='flex flex-row gap-2'>
                            <Image src="/calendar.svg" alt="Calendar Icon" width={20} height={20} />
                            <p>{formattedDate}</p>
                        </div>
                        <div className='flex flex-row gap-2'>
                            <Image src="/star.svg" alt="Star Icon" width={20} height={20} />
                            <p>{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>
                    <p className='line-clamp-2 mt-3'>
                        {feedback?.finalAssessment || "You haven't taken this interview yet.Please start the interview to get feedback."}
                    </p>
                </div>
                <div className='flex flex-row justify-between'>
                    <DisplayTechIcons techstack={techstack}/>
                    <Button className='btn-primary'>
                        <Link href={feedback 
                            ? `/interview/${interviewId}/feedback` 
                            : `/interview/${interviewId}`}>
                        {feedback ? 'Check Feedback' : 'View Interview'}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InterviewCard