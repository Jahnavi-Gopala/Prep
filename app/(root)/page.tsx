import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

const page = () => {
  return (
    <div>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
            <h3>Get Interview-Ready with AI-Powered Practice and Feedback</h3>
            <p>Practice job interviews with AI, get personalized feedback, and ace your next interview.</p>
            <Button asChild className='btn-primary max-sm:w-full'>
              <Link href='/interview'>
                Start an Interview
              </Link>
            </Button>
        </div>
        <Image src = "/robot.png" alt = "robot" width = {400} height = {400} className='max-sm:hidden' />
      </section>
      <section className='flex flex-col gap-6 mt-8'>
          <h2>Your Interviews</h2>
          <div className= "interviews-section" >
            {dummyInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))}
          </div>
            <p>You haven't taken any interviews yet</p>
      </section>
      <section className='flex flex-col gap-6 mt-8'>
          <h2>Take an Interview</h2>
          <div className='interviews-section'>
            {dummyInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))}
          </div>
      </section>
    </div>
  )
}

export default page