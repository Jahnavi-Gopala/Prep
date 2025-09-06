import Link from "next/link";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import Image from "next/image";

export default async function Home() {
  // Get currently logged in user
  const user = await getCurrentUser();

  // If no user is logged in → show welcome section
  if (!user) {
    return (
      <section className="card-cta">
        <h2>Welcome to PrepMock</h2>
        <p>Please sign in to start your first interview.</p>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </section>
    );
  }

  // Fetch user interviews + latest interviews in parallel
  const [userInterviews, allInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (allInterviews?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}'s Past Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                id={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                id={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
  // return (
  //   <div className="home-container">
  //     <section className="welcome-section">
  //       <h1 className="text-3xl font-bold">
  //         Hi {user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "User"} 👋
  //       </h1>
  //       <p className="mt-2 text-muted-foreground">
  //         Ready to practice for your next big interview?
  //       </p>
  //     </section>

  //     {/* Past Interviews */}
  //     <section className="past-interviews-section mt-8">
  //       <h2 className="text-2xl font-semibold">Your Past Interviews</h2>
  //       {hasPastInterviews ? (
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
  //           {(userInterviews ?? []).map((interview) => (
  //             <InterviewCard
  //               key={interview.id}
  //               id={interview.id}
  //               userId={interview.userId}
  //               role={interview.role}
  //               type={interview.type}
  //               techstack={interview.techstack}
  //               createdAt={interview.createdAt}
  //             />
  //           ))}
  //         </div>
  //       ) : (
  //         <p className="text-muted-foreground mt-2">You have no past interviews yet.</p>
  //       )}
  //     </section>

  //     {/* Upcoming Interviews */}
  //     <section className="upcoming-interviews-section mt-8">
  //       <h2 className="text-2xl font-semibold">Upcoming Interviews</h2>
  //       {hasUpcomingInterviews ? (
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
  //           {(allInterviews ?? []).map((interview) => (
  //             <InterviewCard
  //               key={interview.id}
  //               id={interview.id}
  //               userId={interview.userId}
  //               role={interview.role}
  //               type={interview.type}
  //               techstack={interview.techstack}
  //               createdAt={interview.createdAt}
  //             />
  //           ))}
  //         </div>
  //       ) : (
  //         <p className="text-muted-foreground mt-2">No upcoming interviews scheduled.</p>
  //       )}
  //     </section>
  //   </div>
  // );
}



// import Link from "next/link";
// import Image from "next/image";

// import { Button } from "@/components/ui/button";
// import InterviewCard from "@/components/InterviewCard";

// import { getCurrentUser } from "@/lib/actions/auth.actions";
// import {
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";

// async function Home() {
//   const user = await getCurrentUser();
//   const [userInterviews, allInterview] = await Promise.all([
//     getInterviewsByUserId(user?.id!),
//     getLatestInterviews({ userId: user?.id! }),
//   ]);

//   const hasPastInterviews = userInterviews?.length! > 0;
//   const hasUpcomingInterviews = allInterview?.length! > 0;

//   return (
//     <>
//       <section className="card-cta">
//         <div className="flex flex-col gap-6 max-w-lg">
//           <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//           <p className="text-lg">
//             Practice real interview questions & get instant feedback
//           </p>

//           <Button asChild className="btn-primary max-sm:w-full">
//             <Link href="/interview">Start an Interview</Link>
//           </Button>
//         </div>

//         <Image
//           src="/robot.png"
//           alt="robo-dude"
//           width={400}
//           height={400}
//           className="max-sm:hidden"
//         />
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}'s Past Interviews</h2>

//         <div className="interviews-section">
//           {hasPastInterviews ? (
//             userInterviews?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user?.id}
//                 id={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>You haven&apos;t taken any interviews yet</p>
//           )}
//         </div>
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Take Interviews</h2>

//         <div className="interviews-section">
//           {hasUpcomingInterviews ? (
//             allInterview?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user?.id}
//                 id={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>There are no interviews available</p>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }

// export default Home;

// import Link from "next/link";
// import Image from "next/image";

// import { Button } from "@/components/ui/button";
// import InterviewCard from "@/components/InterviewCard";

// import { getCurrentUser } from "@/lib/actions/auth.actions";
// import {
//   getInterviewByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";


// async function Home() {
//   const user = await getCurrentUser();

//   const [userInterviews, allInterview] = await Promise.all([
//   getInterviewByUserId(user?.id!),
//   getLatestInterviews({ userId: user?.id! }),
// ]);


//   const hasPastInterviews = userInterviews?.length! > 0;
//   console.log(hasPastInterviews);
//   const hasUpcomingInterviews = allInterview?.length! > 0;
//   console.log(hasUpcomingInterviews);

//   return (
//     <>
//       <section className="card-cta">
//         <div className="flex flex-col gap-6 max-w-lg">
//           <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//           <p className="text-lg">
//             Practice real interview questions & get instant feedback
//           </p>

//           <Button asChild className="btn-primary max-sm:w-full">
//             <Link href="/interview">Start an Interview</Link>
//           </Button>
//         </div>

//         <Image
//           src="/robot.png"
//           alt="robo-dude"
//           width={400}
//           height={400}
//           className="max-sm:hidden"
//         />
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}'s Past Interview</h2>

//         <div className="interviews-section">
//           {hasPastInterviews ? (
//             userInterviews?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user?.id}
//                 id={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>You haven&apos;t taken any interviews yet</p>
//           )}
//         </div>
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Take Interviews</h2>

//         <div className="interviews-section">
//           {hasUpcomingInterviews ? (
//             allInterview?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user?.id}
//                 id={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>There are no interviews available</p>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }

// export default Home;

// import { Button } from '@/components/ui/button'
// import Link from 'next/link'
// import React from 'react'
// import Image from 'next/image'
// import { dummyInterviews } from '@/constants'
// import InterviewCard from '@/components/InterviewCard'
// import { get } from 'http'
// import { getInterviewByUserId,getLatestInterviews } from '@/lib/actions/general.action'
// import { getCurrentUser } from '@/lib/actions/auth.actions'

// const page = async() => {
//   const user = await getCurrentUser();
//   const [userInterviews, latestInterviews] = await Promise.all([
//     await getInterviewByUserId(user?.id || ''),
//     await getLatestInterviews({ userId: user?.id || '' })
//   ]);

// const hasPastInterviews = Array.isArray(userInterviews) && userInterviews.length > 0;
// const hasUpcomingInterviews = Array.isArray(latestInterviews) && latestInterviews.length > 0;

//   return (
//     <div>
//       <section className='card-cta'>
//         <div className='flex flex-col gap-6 max-w-lg'>
//             <h3>Get Interview-Ready with AI-Powered Practice and Feedback</h3>
//             <p>Practice job interviews with AI, get personalized feedback, and ace your next interview.</p>
//             <Button asChild className='btn-primary max-sm:w-full'>
//               <Link href='/interview'>
//                 Start an Interview
//               </Link>
//             </Button>
//         </div>
//         <Image src = "/robot.png" alt = "robot" width = {400} height = {400} className='max-sm:hidden' />
//       </section>
//       <section className='flex flex-col gap-6 mt-8'>
//             <h2>{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}'s Past Interview</h2>
//           <div className= "interviews-section" >
//             {hasPastInterviews ? (
//               userInterviews?.map((interview) => {
//                 return (
//                   <InterviewCard {...interview} key={interview.id}/>
//                 )
//               })
//             ) : (
//               <p>You haven&apos;t taken any interviews yet</p>
//               )}
//           </div>
//       </section>
//       <section className='flex flex-col gap-6 mt-8'>
//           <h2>Latest Interview</h2>
//           <div className='interviews-section'>
//             {hasUpcomingInterviews ? (
//                 latestInterviews?.map((interview) => {
//                   return (
//                     <InterviewCard {...interview} key={interview.id}/>
//                   )
//                 })
//               ) : (
//                 <p>There are no upcoming interviews</p>
//               )}
//           </div>
//       </section>
//     </div>
//   )
// }

// export default page