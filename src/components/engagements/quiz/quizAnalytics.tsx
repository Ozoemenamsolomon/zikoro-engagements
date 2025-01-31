"use client";

import { useGetData } from "@/hooks/services/requests";
import { useEffect } from "react";
import { TQuiz, TQuestion } from "@/types/quiz";
import { useGetQuizAnswer } from "@/hooks/services/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { MdNavigateBefore } from "react-icons/md";
import { useRouter } from "next/navigation";

type TQuizStatistics = {
  totalParticipants: number;
  activeParticipants: number;
  completionRate: number;
  totalQuestions: number;
  avgCompletionTime: number;
  avgTimeToAnswerQuestion: number;
  totalAllocatedPoints: number;
  avgPointGottenByParticipant: number;
};

type TQuizEngagement = {
  questionNumber: number;
  engagement: number;
}[];

type TQuizResponse = {
  data: TQuiz<TQuestion[]>;
  quizStatistics: TQuizStatistics;
  quizEngagement: TQuizEngagement;
};

function MetricCard({
  metric,
  title,
  subTitle,
}: {
  metric: string;
  title: string;
  subTitle: string;
}) {
  return (
    <div className="w-full px-4 py-6 h-24 flex items-center justify-start gap-3 bg-white border rounded-lg">
      <p className="font-semibold gradient-text bg-basePrimary text-lg sm:text-2xl">
        {metric}
      </p>
      <div className="flex flex-col items-start justify-start gap-2">
        <p className="font-semibold text-base sm:text-lg">{title}</p>
        <p className="text-xs">{subTitle}</p>
      </div>
    </div>
  );
}

export default function QuizAnalytics({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { answers, getAnswers, isLoading: answerLoading } = useGetQuizAnswer();
  const { data, isLoading } = useGetData<TQuizResponse>(
    `engagements/quiz/${quizId}/analytics`
  );

  //   useEffect(() => {
  //     (async () => {
  //       if (actualQuiz) {
  //         await getAnswers(actualQuiz?.id);
  //       }
  //     })();
  //   }, [actualQuiz]);

  if (isLoading || answerLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full text-sm max-w-7xl mx-auto p-4 sm:p-6">
      <div className="w-full flex items-center justify-between">
        <button onClick={() => router.back()}>
          <MdNavigateBefore />
          <p className="text-sm hidden sm:block">{data?.data?.coverTitle}</p>
        </button>
        <h2 className="font-semibold text-lg sm:text-base">Analytics</h2>
        <p className="w-1 h-1"></p>
      </div>
      <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
        Overview
      </h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="w-full flex flex-col items-start gap-4">
          <MetricCard
            title="Total Participants"
            subTitle="Number of people that participated"
            metric={`${data?.quizStatistics?.totalParticipants}`}
          />
          <MetricCard
            title="Completion Rate"
            subTitle="Percentage of participants who completed the quiz"
            metric={`${data?.quizStatistics?.completionRate}%`}
          />
          <MetricCard
            title="Avg time to complete the quiz"
            subTitle="Avg time taken for participants to complete the quiz"
            metric={`${data?.quizStatistics?.avgCompletionTime} Sec`}
          />
          <MetricCard
            title="Total Points Allocated"
            subTitle="Total number of points allocated to the quiz"
            metric={`${data?.quizStatistics?.totalAllocatedPoints}`}
          />
        </div>
        <div className="w-full flex flex-col items-start gap-4">
          <MetricCard
            title="Active Participants"
            subTitle="Participants that attempted 50% of the question"
            metric={`${data?.quizStatistics?.activeParticipants}`}
          />
          <MetricCard
            title="Total Questions"
            subTitle="Number of questions available to be answered"
            metric={`${data?.quizStatistics?.totalQuestions}%`}
          />
          <MetricCard
            title="Avg time to answer a question"
            subTitle="Avg time taken for participants to answer each question"
            metric={`${data?.quizStatistics?.avgTimeToAnswerQuestion} Sec`}
          />
          <MetricCard
            title="Avg Points"
            subTitle="Avg points gotten by participants"
            metric={`${data?.quizStatistics?.avgPointGottenByParticipant}`}
          />
        </div>
      </div>
    </div>
  );
}
