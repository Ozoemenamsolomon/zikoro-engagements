"use client";
import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGetData } from "@/hooks/services/requests";
import { useEffect } from "react";
import { TQuiz, TQuestion, TAnswer, TRefinedQuestion } from "@/types/quiz";
import { useGetQuizAnswer } from "@/hooks/services/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { MdNavigateBefore } from "react-icons/md";
import { useRouter } from "next/navigation";
import { SingleQuestionCard } from "./addQuizQuestions/AddedQuestion";
import { cn } from "@/lib/utils";
import { PeopleIcon } from "@/constants";

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
  quiz: TQuiz<TQuestion[]>;
  quizStatistics: TQuizStatistics;
  quizEngagement: TQuizEngagement;
  quizAnswer: TAnswer[];
};

export type TEngagementAnalytics = {
  questionId: string;
  questionText: string;
  options: TRefinedQuestion["options"];
};

function calculateEngagementAnalytics(
  answers: TAnswer[]
): TEngagementAnalytics[] {
  const questionMap = new Map<
    string,
    {
      questionText: string;
      count: number;
      options: TRefinedQuestion["options"];
    }
  >();

  answers.forEach((answer) => {
    const { questionId, answeredQuestion } = answer;
    const questionText = answeredQuestion.question;

    if (!questionMap.has(questionId)) {
      questionMap.set(questionId, {
        questionText,
        count: 0,
        options: answeredQuestion.options,
      });
    }

    questionMap.get(questionId)!.count++;
  });

  return Array.from(questionMap.entries()).map(
    ([questionId, { questionText, count, options }]) => ({
      questionId,
      questionText,
      percentage: (count / answers.length) * 100,
      options,
    })
  );
}

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

function QuizEngagementInsight({
  analytics,

  totalParticipants,
}: {
  analytics: TEngagementAnalytics[];

  totalParticipants: number;
}) {
  const [activeAnalytics, setActiveAnalytics] =
    useState<TEngagementAnalytics | null>(analytics[0]);
  const [currentIndex, setCurrentIndex] = useState(1);
  return (
    <div className="w-full mt-10">
      <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
        Engagement Insight
      </h2>

      <div className="w-full bg-white h-[400px] rounded-lg grid grid-cols-12">
        <div className="w-full h-full col-span-3 border-r overflow-y-auto vert-scroll p-4 sm:p-6">
          <div className="mb-4">
            No. Questions :{" "}
            <span className="text-basePrimary font-medium">
              {" "}
              {analytics?.length}
            </span>
          </div>

          <div className="w-full flex flex-col items-start justify-start gap-3">
            {analytics?.map((analytic, index) => (
              <div
                onClick={() => {
                  setActiveAnalytics(analytic);
                  setCurrentIndex(index + 1);
                }}
                key={index}
                className={cn(
                  "w-full flex items-center rounded-lg p-3 border h-36  flex-col gap-6",
                  analytic?.questionId === activeAnalytics?.questionId &&
                    " border-basePrimary"
                )}
              >
                <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                  {index + 1}
                </p>

                <div
                  className="innerhtml items-center text-sm w-full line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: analytic?.questionText ?? "",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full col-span-9 overflow-y-auto vert-scroll p-4 sm:p-6">
          <div className="w-full flex items-center justify-between mb-8">
            <div className="flex flex-col items-start justify-start ">
              <div className="bg-basePrimary-200 relative h-10 justify-center px-3 rounded-3xl flex items-center gap-x-2">
                <PeopleIcon />
                <p>{totalParticipants}</p>
              </div>

              <p>Participants</p>
            </div>
            <div className="flex flex-col items-center justify-center ">
              <p className="font-semibold text-lg gradient-text bg-basePrimary">
                10 Secs
              </p>
              <p>Avg. Answer Time</p>
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
            <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
              {currentIndex}
            </p>
            <div
              className="innerhtml items-center text-sm w-full font-semibold line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: activeAnalytics?.questionText ?? "",
              }}
            />
          </div>
        </div>
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

  const engagementInsight = useMemo(() => {
    if (
      data &&
      Array.isArray(data?.quiz?.questions) &&
      Array.isArray(data?.quizAnswer)
    ) {
      return calculateEngagementAnalytics(data?.quizAnswer);
    } else return [];
  }, [data]);

  console.log(data);

  if (isLoading || answerLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full text-sm max-w-7xl mx-auto p-4 sm:p-6">
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          className="flex items-center gap-x-2"
          onClick={() => router.back()}
        >
          <MdNavigateBefore />
          <p className="text-sm hidden sm:block">{data?.quiz?.coverTitle}</p>
        </button>
        <h2 className="font-semibold text-lg sm:text-base">Analytics</h2>
        <p className="w-1 h-1"></p>
      </div>
      <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
        Overview
      </h2>
      <div className="w-full grid grid-cols-1  md:grid-cols-3 gap-4">
        <div className="w-full flex  flex-col items-start gap-4">
          <MetricCard
            title="Total Participants"
            subTitle="Number of people that participated"
            metric={`${data?.quizStatistics?.totalParticipants ?? 0}%`}
          />
          <MetricCard
            title="Completion Rate"
            subTitle="Percentage of participants who completed the quiz"
            metric={`${data?.quizStatistics?.completionRate ?? 0}%`}
          />
          <MetricCard
            title="Avg time to complete the quiz"
            subTitle="Avg time taken for participants to complete the quiz"
            metric={`${(data?.quizStatistics?.avgCompletionTime ?? 0)/1000} Sec`}
          />
          <MetricCard
            title="Total Points Allocated"
            subTitle="Total number of points allocated to the quiz"
            metric={`${data?.quizStatistics?.totalAllocatedPoints ?? 0}`}
          />
        </div>
        <div className="w-full flex flex-col items-start gap-4">
          <MetricCard
            title="Active Participants"
            subTitle="Participants that attempted 50% of the question"
            metric={`${data?.quizStatistics?.activeParticipants ?? 0}`}
          />
          <MetricCard
            title="Total Questions"
            subTitle="Number of questions available to be answered"
            metric={`${data?.quizStatistics?.totalQuestions ?? 0}`}
          />
          <MetricCard
            title="Avg time to answer a question"
            subTitle="Avg time taken for participants to answer each question"
            metric={`${(data?.quizStatistics?.avgTimeToAnswerQuestion ?? 0)/1000} Sec`}
          />
          <MetricCard
            title="Avg Points"
            subTitle="Avg points gotten by participants"
            metric={`${data?.quizStatistics?.avgPointGottenByParticipant ?? 0}`}
          />
        </div>
        <div className="w-full h-[430px] bg-white rounded-lg py-6 px-4  ">
          <h2 className="font-semibold text-base sm:text-lg mb-4">
            Participants Engagement
          </h2>

          <ResponsiveContainer width="100%" maxHeight={430}>
            <LineChart width={500} height={400} data={data?.quizEngagement}>
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="questionNumber" />
              <YAxis />
              <Tooltip />
              {/* <Legend /> */}

              <Line type="monotone" dataKey="engagement" stroke="#001fcc" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <QuizEngagementInsight
        analytics={engagementInsight}
        totalParticipants={data?.quizStatistics?.totalParticipants}
      />
    </div>
  );
}
