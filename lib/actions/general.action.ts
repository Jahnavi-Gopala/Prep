"use server";
import { feedbackSchema } from "@/constants";
import {db} from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { object } from "zod";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsById(id: string): Promise<Interview| null> {
  const interview = await db
    .collection("interviews")
    .doc(id)
    .get();
  return interview.data() as Interview | null;
}

export async function createFeedback(params : CreateFeedbackParams){
  const { interviewId, userId, transcript} = params;
  try{
    const formattedTranscript = transcript.map(
      (sentence: { role: string; content: string }) =>
        `- ${sentence.role}: ${sentence.content}\n`
    ).join("");

    const {
      object: {
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-1.5-flash", {
      structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
      You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
      Transcript:
      ${formattedTranscript}

      Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
      - **Communication Skills**: Clarity, articulation, structured responses.
      - **Technical Knowledge**: Understanding of key concepts for the role.
      - **Problem-Solving**: Ability to analyze problems and propose solutions.
      - **Cultural & Role Fit**: Alignment with company values and job role.
      - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
      `,
      system:
      "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });
    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    })
    return {
      success: true, 
      feedbackId: feedback.id
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      success: false,
      error: "Error generating feedback",
    };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) {
    return null;
  }

  const feedbackDoc = feedback.docs[0];

  return {
    id: feedbackDoc.id, ...feedbackDoc.data(),
  } as Feedback;
}


// ------------Use this----------
// import { generateObject } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { feedbackSchema } from "@/constants";

// export async function createFeedback(params: CreateFeedbackParams) {
//   const { interviewId, userId, transcript, feedbackId } = params;
// // try {
// //   const formattedTranscript = transcript.map(
// //     (sentence: { role: string; content: string }) =>
// //       `- ${sentence.role}: ${sentence.content}\n`
// //   ).join("");

// //   const result = await generateObject({
// //     model: google("gemini-2.0-flash-001", {
// //         structuredOutputs: false,
// //       }),
// //     schema: feedbackSchema,
// //     prompt: `...`,
// //     system: `...`,
// //   });

// //   console.log("AI result:", result);

// //   if (!result?.object) {
// //     console.error("AI returned no structured object");
// //     return { success: false, error: "Empty structured output" };
// //   }

// //   const {
// //     totalScore,
// //     categoryScores,
// //     strengths,
// //     areasForImprovement,
// //     finalAssessment,
// //   } = result.object;

// //   const feedback = await db.collection("feedback").add({
// //     interviewId,
// //     userId,
// //     totalScore,
// //     categoryScores,
// //     strengths,
// //     areasForImprovement,
// //     finalAssessment,
// //     createdAt: new Date().toISOString(),
// //   });

// //   console.log("✅ Feedback saved:", feedback.id);

// //   return { success: true, feedbackId: feedback.id };
// // } catch (error) {
// //   console.error("❌ Error saving feedback:", error);
// //   return { success: false, error: error instanceof Error ? error.message : String(error) };
// // }

//   try {
//     const formattedTranscript = transcript
//       .map(
//         (sentence: { role: string; content: string }) =>
//           `- ${sentence.role}: ${sentence.content}\n`
//       )
//       .join("");

//     const result = await generateObject({
//       model: google("gemini-2.0-flash-001", {
//         structuredOutputs: false,
//       }),
//       schema: feedbackSchema,
//       prompt: `
//         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
//         Transcript:
//         ${formattedTranscript}

//         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//         - **Communication Skills**: Clarity, articulation, structured responses.
//         - **Technical Knowledge**: Understanding of key concepts for the role.
//         - **Problem-Solving**: Ability to analyze problems and propose solutions.
//         - **Cultural & Role Fit**: Alignment with company values and job role.
//         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
//         `,
//       system:
//         "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
//     });
//     const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = result.object;

//     const feedback = await db.collection("feedback").add({
//       interviewId,
//       userId,
//       totalScore,
//       categoryScores,
//       strengths,
//       areasForImprovement,
//       finalAssessment,
//       createdAt: new Date().toISOString(),
//     });
//     console.log(feedback);

//     // let feedbackRef;

//     // if (feedbackId) {
//     //   feedbackRef = db.collection("feedback").doc(feedbackId);
//     // } else {
//     //   feedbackRef = db.collection("feedback").doc();
//     // }

//     // await feedbackRef.set(feedback);

//     return { success: true, feedbackId: feedback.id };
//   } catch (error) {
//     console.error("Error saving feedback:", error);
//     return { success: false };
//   }
// }

// export async function getInterviewById(id: string): Promise<Interview | null> {
//   const interview = await db.collection("interviews").doc(id).get();

//   return interview.data() as Interview | null;
// }

// export async function getLatestInterviews(
//   params: GetLatestInterviewsParams
// ): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;

//   const interviews = await db
//     .collection("interviews")
//     .orderBy("createdAt", "desc")
//     .where("finalized", "==", true)
//     .where("userId", "!=", userId)
//     .limit(limit)
//     .get();

//   return interviews.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }

// export async function getFeedbackByInterviewId(
//   params: GetFeedbackByInterviewIdParams
// ): Promise<Feedback | null> {
//   const { interviewId, userId } = params;

//   const feedback = await db
//     .collection("feedback")
//     .where("interviewId", "==", interviewId)
//     .where("userId", "==", userId)
//     .limit(1)
//     .get();

//   if (feedback.empty) return null;

//   const feedbackDoc = feedback.docs[0];
//   return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
// }



// export async function getInterviewsByUserId(
//   userId: string
// ): Promise<Interview[] | null> {
//   const interviews = await db
//     .collection("interviews")
//     .where("userId", "==", userId)
//     .orderBy("createdAt", "desc")
//     .get();
//   return interviews.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }
// --------------till here ----------------
// // general.actions.ts
// "use server";

// import { db } from "@/firebase/admin";
// import { google } from "@ai-sdk/google";
// import { generateObject } from "ai";
// import { feedbackSchema } from "@/constants";

// // Get past interviews for a user (completed only)
// export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
//   const interviewsSnapshot = await db
//     .collection("interviews")
//     .where("userId", "==", userId)
//     .where("status", "==", "completed")
//     .orderBy("createdAt", "desc")
//     .get();

//   if (interviewsSnapshot.empty) return [];

//   return interviewsSnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }

// // Get public & finalized interviews from other users
// export async function getLatestInterviews(
//   params: GetLatestInterviewsParams
// ): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;

//   const interviewsSnapshot = await db
//     .collection("interviews")
//     .where("finalized", "==", true)
//     .where("status", "==", "completed")
//     .where("isPublic", "==", true)
//     .where("userId", "!=", userId)
//     .orderBy("userId")
//     .orderBy("createdAt", "desc")
//     .limit(limit)
//     .get();

//   if (interviewsSnapshot.empty) return [];

//   return interviewsSnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }

// // Create feedback and mark interview as completed/finalized
// export async function createFeedback(params: CreateFeedbackParams) {
//   const { interviewId, userId, transcript } = params;

//   try {
//     const formattedTranscript = transcript
//       .map((s: { role: string; content: string }) => `-${s.role}: ${s.content}\n`)
//       .join('');

//     const {
//       object: {
//         totalScore,
//         categoryScores,
//         strengths,
//         areasForImprovement,
//         finalAssessment,
//       },
//     } = await generateObject({
//       model: google("gemini-2.0-flash-001", { structuredOutputs: false }),
//       schema: feedbackSchema,
//       prompt: `
//         You are an AI interviewer analyzing a mock interview. Be critical and detailed.
//         Transcript:
//         ${formattedTranscript}

//         Score categories:
//         - Communication Skills
//         - Technical Knowledge
//         - Problem-Solving
//         - Cultural & Role Fit
//         - Confidence & Clarity
//       `,
//       system:
//         "You are a professional interviewer analyzing a mock interview based on structured categories.",
//     });

//     const feedback = await db.collection("feedback").add({
//       interviewId,
//       userId,
//       totalScore,
//       categoryScores,
//       strengths,
//       areasForImprovement,
//       finalAssessment,
//       createdAt: new Date().toISOString(),
//     });

//     // ✅ Update interview status
//     await db.collection("interviews").doc(interviewId).update({
//       status: "completed",
//       finalized: true,
//       isPublic: true, // Optional based on your logic
//     });

//     return { success: true, feedbackId: feedback.id };
//   } catch (error) {
//     console.error("Error saving feedback:", error);
//     return { success: false, feedbackId: null };
//   }
// }

// // Get feedback for a specific interview
// export async function getFeedbackByInterviewId(
//   params: GetLatestInterviewsParams
// ): Promise<Feedback | null> {
//   const { interviewId, userId } = params;

//   const feedback = await db
//     .collection("feedback")
//     .where("interviewId", "==", interviewId)
//     .where("userId", "==", userId)
//     .limit(1)
//     .get();

//   if (feedback.empty) return null;

//   const feedbackDoc = feedback.docs[0];
//   return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
// }



// "use server";

// import { feedbackSchema } from "@/constants";
// import { db } from "@/firebase/admin";
// import { google } from "@ai-sdk/google";
// import { generateObject } from "ai";

// // export async function getInterviewByUserId(userId: string):Promise<Interview[] | null> {
// //     const interviews = await db
// //         .collection('interviews')
// //         .where('userId', '==', userId)
// //         .orderBy('createdAt', 'desc')
// //         .get();
// //     return interviews.docs.map((doc) => ({
// //         id: doc.id,
// //         ...doc.data(),
// //     } as Interview));
// // }
// export async function getInterviewByUserId(
//   userId: string
// ): Promise<Interview[] | null> {
//   const interviewsSnapshot = await db
//     .collection("interviews")
//     .where("userId", "==", userId)
//     .where("status", "==", "completed")
//     .orderBy("createdAt", "desc")
//     .get();

//   if (interviewsSnapshot.empty) return [];

//   return interviewsSnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }


// // export async function getLatestInterviews(params: GetLatestInterviewsParams):Promise<Interview[] | null> {
// //     const { userId, limit=20 } = params;
// //     const interviews = await db
// //         .collection('interviews')
// //         .orderBy('createdAt', 'desc')
// //         .where('finalized', '==', true)
// //         .where('userId', '!=', userId)
// //         .limit(limit)
// //         .get();
// //     return interviews.docs.map((doc) => ({
// //         id: doc.id,
// //         ...doc.data(),
// //     } as Interview));
// // }
// // export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
// //   const { userId, limit = 20 } = params;

// //   const interviews = await db
// //     .collection('interviews')
// //     .where('finalized', '==', true)
// //     .orderBy('createdAt', 'desc')
// //     .limit(limit * 2) // fetch more to allow filtering out the user's own
// //     .get();

// //   const filteredInterviews = interviews.docs
// //     .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
// //     .filter((interview) => interview.userId !== userId)
// //     .slice(0, limit); // limit results after filtering

// //   return filteredInterviews;
// // }
// export async function getLatestInterviews(
//   params: GetLatestInterviewsParams
// ): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;

//   const interviewsSnapshot = await db
//     .collection("interviews")
//     .where("finalized", "==", true)          // ✅ Interview finalized
//     .where("status", "==", "completed")      // ✅ Only completed interviews
//     .where("userId", "!=", userId)           // ✅ Exclude current user’s interviews
//     .orderBy("userId")                       // 🔑 Required for Firestore composite index
//     .orderBy("createdAt", "desc")
//     .limit(limit)
//     .get();

//   if (interviewsSnapshot.empty) return [];

//   return interviewsSnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   })) as Interview[];
// }


// export async function getInterviewById(id: string):Promise<Interview | null> {
//     const interview = await db
//         .collection('interviews')
//         .doc(id)
//         .get();
//     return interview.data() as Interview | null;
// }

// export async function createFeedback(params: CreateFeedbackParams){
//   const{interviewId, userId, transcript} = params;
//   try{
//     const formattedTranscrpit = transcript
//       .map((sentence: { role: string; content: string }) => `-${sentence.role}: ${sentence.content}\n`)
//       .join('');
//     const { object : {totalScore, categoryScores, strengths, areasForImprovement, finalAssessment}} = await generateObject({
//       model : google("gemini-2.0-flash-001",{
//         structuredOutputs: false,
//       }),
//       schema: feedbackSchema,
//       prompt: `
//         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
//         Transcript:
//         ${formattedTranscrpit}

//         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//         - **Communication Skills**: Clarity, articulation, structured responses.
//         - **Technical Knowledge**: Understanding of key concepts for the role.
//         - **Problem-Solving**: Ability to analyze problems and propose solutions.
//         - **Cultural & Role Fit**: Alignment with company values and job role.
//         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
//         `,
//       system:
//         "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    
//     });
//     const feedback = await db.collection('feedback').add({
//       interviewId,
//       userId,
//       totalScore,
//       categoryScores,
//       strengths,
//       areasForImprovement,
//       finalAssessment,
//       createdAt : new Date().toISOString(),
//     });
//     return {
//       success: true,
//       feedbackId: feedback.id
//     };
//   }catch(error){
//     console.error('Error saving feedback:', error);
//     return {
//       success: false,
//       feedbackId: null
//     };
//   }
// }

// export async function getFeedbackByInterviewId(params: GetLatestInterviewsParams): Promise<Feedback | null> {
//   const { interviewId, userId} = params;

//   const feedback= await db
//     .collection('feedback')
//     .where('interviewId', '==', interviewId)
//     .where('userId', '==', userId)
//     .limit(1) 
//     .get();

//   if(feedback.empty){
//     return null;
//   } 

//   const feedbackDoc = feedback.docs[0];
//   return {
//     id: feedbackDoc.id,
//     ...feedbackDoc.data(),
//   } as Feedback;
//   }