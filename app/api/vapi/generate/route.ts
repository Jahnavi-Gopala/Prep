// import { generateText, generateObject } from "ai";
// import { google } from "@ai-sdk/google";
// import { db, auth } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";
// import { feedbackSchema } from "@/constants";
// import { cookies } from "next/headers";

// export async function POST(request: Request) {
//   const body = await request.json();

//   try {
//     // Common auth step
//     const cookieStore = await cookies();
//     const sessionCookie = cookieStore.get("session")?.value;

//     if (!sessionCookie) {
//       return Response.json({ success: false, error: "Not Authenticated" }, { status: 401 });
//     }

//     const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
//     const uid = decodedClaims.uid;

//     // Decide mode: interview or feedback
//     if (body.mode === "interview") {
//       const { type, role, level, techstack, amount } = body;

//       const { text: questions } = await generateText({
//         model: google("gemini-2.0-flash-001"),
//         prompt: `Prepare questions for a job interview.
//           The job role is ${role}.
//           The job experience level is ${level}.
//           The tech stack used in the job is: ${techstack}.
//           The focus between behavioural and technical questions should lean towards: ${type}.
//           The amount of questions required is: ${amount}.
//           Please return only the questions, without any additional text.
//           The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//           Return the questions formatted like this:
//           ["Question 1", "Question 2", "Question 3"]
//         `,
//       });

//       const interview = {
//         role,
//         type,
//         level,
//         techstack: techstack.split(","),
//         questions: JSON.parse(questions),
//         userId: uid,
//         finalized: true,
//         coverImage: getRandomInterviewCover(),
//         createdAt: new Date().toISOString(),
//       };

//       await db.collection("interviews").add(interview);

//       return Response.json({ success: true, message: "Interview created successfully." }, { status: 200 });

//     } else if (body.mode === "feedback") {
//       const { interviewId, transcript, feedbackId } = body;

//       const formattedTranscript = transcript
//         .map((s: { role: string; content: string }) => `- ${s.role}: ${s.content}`)
//         .join("\n");

//       const result = await generateObject({
//         model: google("gemini-2.0-flash-001"),
//         schema: feedbackSchema,
//         prompt: `
//           You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

//           Transcript:
//           ${formattedTranscript}

//           Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//           - Communication Skills
//           - Technical Knowledge
//           - Problem-Solving
//           - Cultural & Role Fit
//           - Confidence & Clarity
//         `,
//         system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.",
//       });

//       const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = result.object;

//       const feedbackData = {
//         interviewId,
//         userId: uid,
//         totalScore,
//         categoryScores,
//         strengths,
//         areasForImprovement,
//         finalAssessment,
//         createdAt: new Date().toISOString(),
//       };

//       const feedbackRef = feedbackId
//         ? db.collection("feedback").doc(feedbackId)
//         : db.collection("feedback").doc();

//       await feedbackRef.set(feedbackData);

//       return Response.json({ success: true, feedbackId: feedbackRef.id }, { status: 200 });
//     } else {
//       return Response.json({ success: false, error: "Invalid mode provided." }, { status: 400 });
//     }

//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error }, { status: 500 });
//   }
// }



import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db, auth } from "@/firebase/admin"; // make sure auth is imported
import { getRandomInterviewCover } from "@/lib/utils";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount } = await request.json();

  try {
    // ✅ Get UID from session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return Response.json({ success: false, error: "Not Authenticated" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    console.log("UID:", uid);

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: uid, // ✅ Use real UID from auth
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}



// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   try {
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `,
//     });

//     const interview = {
//       role: role,
//       type: type,
//       level: level,
//       techstack: techstack.split(","),
//       questions: JSON.parse(questions),
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("interviews").add(interview);

//     return Response.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error: error }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }