import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  TQuiz,
  TQuestion,
  TAnswer,
} from "@/types/quiz";

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const supabase = createClient();

  if (req.method === "GET") {
    const { quizId } = params;

    try {
      const { data, error, status } = await supabase
        .from("quiz")
        .select("*")
        .eq("quizAlias", quizId)
        .single();

      if (error) {
        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 400,
          }
        );
      }

      if (error) throw error;

      //
      const quizStatistics = {
        totalParticipants: 0,
        activeParticipants: 0,
        completionRate: 0,
        totalQuestions: 0,
        avgCompletionTime: 0,
        avgTimeToAnswerQuestion: 0,
        totalAllocatedPoints: 0,
        avgPointGottenByParticipant: 0,
      };

      let quizEngagement: {
        questionNumber: number;
        engagement: number;
      }[] = [];

      let answersQuiz: TAnswer[] = []

      if (data) {
        const {
          data: quizAnswers,
          error,
          status,
        } = await supabase
          .from("quizAnswer")
          .select("*")
          .eq("quizId", data?.id);

        const quiz: TQuiz<TQuestion[]> = data;

        quizStatistics["totalParticipants"] = Array.isArray(
          quiz?.quizParticipants
        )
          ? quiz?.quizParticipants?.length
          : 0;

        quizStatistics["totalQuestions"] = Array.isArray(quiz?.questions)
          ? quiz?.questions?.length
          : 0;

        quizStatistics["totalAllocatedPoints"] = Array.isArray(quiz?.questions)
          ? quiz?.questions?.reduce(
              (acc, curr) => acc + Number(curr?.points),
              0
            )
          : 0;
        // participants with id

        if (Array.isArray(quizAnswers)) {
          const answers: TAnswer[] = quizAnswers;
          answersQuiz = answers;

          const {
            attemptedPercentage,
            completedPercentage,
            avgCompletionTime,
            avgAnswerTime,
            avgPoints,
          } = calculateQuizStats(answers, quiz);

          quizStatistics["activeParticipants"] = attemptedPercentage;
          quizStatistics["completionRate"] = completedPercentage;
          quizStatistics["avgCompletionTime"] = avgCompletionTime;
          quizStatistics["avgTimeToAnswerQuestion"] = avgAnswerTime;
          quizStatistics["avgPointGottenByParticipant"] = avgPoints;

          quizEngagement = calculateQuizEngagement(answers, quiz);
        }
      }

      return NextResponse.json(
        {
          data: {
            quiz: data,
            quizStatistics,
            quizEngagement,
            quizAnswer: answersQuiz
          },
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: "An error occurred while making the request.",
        },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";

function calculateQuizStats(answers: TAnswer[], quiz: TQuiz<TQuestion[]>) {
  const totalParticipants = new Set(
    answers.map((answer) => answer.quizParticipantId)
  ).size;
  const totalQuestions = quiz.questions.length;

  const participantAnswers = answers.reduce((acc, answer) => {
    if (!acc[answer.quizParticipantId]) acc[answer.quizParticipantId] = [];
    acc[answer.quizParticipantId].push(answer);
    return acc;
  }, {} as Record<string, TAnswer[]>);

  let attemptedCount = 0;
  let completedCount = 0;
  let totalCompletionTime = 0;
  let totalAnswerTime = 0;
  let totalPoints = 0;
  let totalAnswers = 0;

  Object.values(participantAnswers).forEach((participantAnswer) => {
    const attemptedQuestions = participantAnswer.length;
    const totalDuration = participantAnswer.reduce(
      (sum, ans) => sum + ((ans.maxDuration * 1000)- ans.answerDuration),
      0
    );
    const totalParticipantPoints = participantAnswer.reduce(
      (sum, ans) => sum + ans.attendeePoints,
      0
    );

    if (attemptedQuestions >= totalQuestions * 0.5) {
      attemptedCount++;
    }
    if (attemptedQuestions === totalQuestions) {
      completedCount++;
      totalCompletionTime += totalDuration;
    }

    totalAnswerTime += totalDuration;
    totalPoints += totalParticipantPoints;
    totalAnswers += attemptedQuestions;
  });

  const attemptedPercentage = attemptedCount ;
  const completedPercentage = (completedCount / totalParticipants) * 100;
  const avgCompletionTime = completedCount
    ? totalCompletionTime / completedCount
    : 0;
  const avgAnswerTime = totalAnswers ? totalAnswerTime / totalAnswers : 0;
  const avgPoints = totalParticipants ? totalPoints / totalParticipants : 0;

  return {
    attemptedPercentage,
    completedPercentage,
    avgCompletionTime,
    avgAnswerTime,
    avgPoints,
  };
}

function calculateQuizEngagement(answers: TAnswer[], quiz: TQuiz<TQuestion[]>) {
  const questionEngagement: Record<string, number> = {};

  quiz.questions.forEach((question, index) => {
    questionEngagement[question.id] = 0;
  });

  answers.forEach((answer) => {
    if (questionEngagement[answer.questionId] !== undefined) {
      questionEngagement[answer.questionId]++;
    }
  });

  const engagementData = quiz.questions.map((question, index) => ({
    questionNumber: index + 1,
    engagement: questionEngagement[question.id] || 0,
  }));

  return engagementData;
}
