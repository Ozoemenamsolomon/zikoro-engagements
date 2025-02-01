"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
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
import { TQuiz, TQuestion, TAnswer, TRefinedQuestion } from "@/types/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { MdNavigateBefore } from "react-icons/md";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyQuizQuestionIcon, PeopleIcon } from "@/constants";
import { formatReviewNumber } from "@/utils";

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

type QuestionOption = {
  optionId: string;
  option?: any;
  isAnswer: string;
  isCorrect: boolean | string;
  selectionPercentage: number; // New field
};

export type TEngagementAnalytics = {
  questionId: string;
  questionText: string;
  duration: number;
  options: QuestionOption[];
};

function calculateOptionSelectionPercentage(
  answers: TAnswer[]
): TEngagementAnalytics[] {
  const questionMap = new Map<
    string,
    {
      questionText: string;
      optionsCount: Map<string, number>;
      totalResponses: number;
      duration: number;
      options: TRefinedQuestion["options"];
    }
  >();

  // Step 1: Count how many times each option was selected
  answers.forEach((answer) => {
    const { questionId, answeredQuestion, selectedOptionId, answerDuration } =
      answer;
    const questionText = answeredQuestion.question;
    const selectedOption = selectedOptionId.optionId;

    if (!questionMap.has(questionId)) {
      questionMap.set(questionId, {
        questionText,
        totalResponses: 0,
        duration: 0,
        optionsCount: new Map(),
        options: answeredQuestion.options,
      });
    }

    const questionData = questionMap.get(questionId)!;
    questionData.totalResponses++;

    // Increment the count for the selected option
    questionData.optionsCount.set(
      selectedOption,
      (questionData.optionsCount.get(selectedOption) || 0) + 1
    );

    // summation of duration
    questionData.duration += answerDuration;
  });

  // Step 2: Transform into the expected output
  return Array.from(questionMap.entries()).map(
    ([
      questionId,
      { questionText, optionsCount, totalResponses, options, duration },
    ]) => ({
      questionId,
      questionText,
      duration,
      options: options.map((option) => ({
        ...option,
        selectionPercentage:
          totalResponses > 0
            ? ((optionsCount.get(option.optionId) || 0) / totalResponses) * 100
            : 0,
      })),
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

function QuestOption({
  option,
  index,
}: {
  option: QuestionOption;
  index: number;
}) {
  const isImageOption = (option?.option as string)?.startsWith("https://");
  const optionLetters = ["A", "B", "C", "D"];
  return (
    <>
      {isImageOption ? (
        <button
          className={cn(
            "w-fit  text-gray-600 gap-3 flex flex-col items-center p-2 h-fit rounded-lg  bg-basePrimary-100",
            typeof option?.optionId === option?.isAnswer &&
              "bg-green-500 text-white"
          )}
        >
          <span
            className={cn(
              "rounded-lg h-9 flex items-center text-gray-600 justify-center font-medium w-9 bg-white border border-gray-700",
              typeof option?.optionId === option?.isAnswer && "text-green-500"
            )}
          >
            {optionLetters[index]}
          </span>
          <div className="w-full flex items-center justify-between">
            <div className="w-11/12 relative h-2 rounded-3xl bg-gray-200">
              <span
                style={{
                  width: option?.selectionPercentage
                    ? `${option?.selectionPercentage.toFixed(0)}%`
                    : "0%",
                }}
                className={cn(
                  "absolute rounded-3xl ring-1 ring-white bg-[#001fcc] inset-0  h-full",

                  typeof option?.optionId === option?.isAnswer && "bg-green-500"
                )}
              ></span>
            </div>

            <div className="text-mobile">
              <span>
                {option?.selectionPercentage
                  ? `${option?.selectionPercentage.toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
          </div>
          <Image
            src={option?.option}
            alt=""
            width={400}
            height={400}
            className="w-28 rounded-lg object-cover h-32"
          />
        </button>
      ) : (
        <button
          className={cn(
            "w-full px-4 text-gray-600 space-y-1 mb-4  min-h-[60px] h-fit rounded-lg  bg-basePrimary-100",
            typeof option?.optionId === option?.isAnswer &&
              "bg-green-500 text-white"
          )}
        >
          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center gap-x-2">
              <span
                className={cn(
                  "rounded-lg h-9 flex items-center text-gray-600 justify-center font-medium w-9 bg-white border border-gray-700",
                  typeof option?.optionId === option?.isAnswer &&
                    "text-green-500 "
                )}
              >
                {optionLetters[index]}
              </span>

              <div
                className="innerhtml"
                dangerouslySetInnerHTML={{
                  __html: option?.option ?? "",
                }}
              />
            </div>

            <div className="text-mobile">
              <span>
                {option?.selectionPercentage
                  ? `${option?.selectionPercentage.toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
          </div>

          <div className="w-full relative h-2 rounded-3xl bg-gray-200">
            <span
              style={{
                width: option?.selectionPercentage
                  ? `${option?.selectionPercentage.toFixed(0)}%`
                  : "0%",
              }}
              className={cn(
                "absolute rounded-3xl ring-1 ring-white inset-0 bg-[#001fcc] h-full",
                typeof option?.optionId === option?.isAnswer &&
                  "bg-green-500 text-white"
              )}
            ></span>
          </div>
        </button>
      )}
    </>
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
  const avgDuration = useMemo(() => {
    if (Array.isArray(analytics) && analytics?.length === 0) {
      return analytics?.reduce((acc, curr) => acc + curr?.duration, 0) / 1000;
    } else return 0;
  }, [analytics]);
  return (
    <div className="w-full mt-10">
      <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
        Engagement Insight
      </h2>
      {analytics?.length === 0 ? (
        <div className="w-full flex flex-col p-4 sm:p-6 items-center justify-center h-[500px] bg-white rounded-lg">
          <EmptyQuizQuestionIcon />
          <h2 className="font-semibold text-base sm:text-lg mt-5">
            No Question has been answered
          </h2>
        </div>
      ) : (
        <div className="w-full bg-white h-[500px] rounded-lg grid grid-cols-12">
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
                  {avgDuration} Secs
                </p>
                <p>Avg. Answer Time</p>
              </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
              <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                {currentIndex}
              </p>
              <div
                className="innerhtml items-center text-center text-sm w-full font-semibold line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: activeAnalytics?.questionText ?? "",
                }}
              />

              <div className="w-full flex flex-col items-start justify-start gap-1">
                {activeAnalytics?.options?.map((option, index) => (
                  <QuestOption key={index} index={index} option={option} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizAnalytics({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { data, isLoading } = useGetData<TQuizResponse>(
    `engagements/quiz/${quizId}/analytics`
  );

  const engagementInsight = useMemo(() => {
    if (
      data &&
      Array.isArray(data?.quiz?.questions) &&
      Array.isArray(data?.quizAnswer)
    ) {
      return calculateOptionSelectionPercentage(data?.quizAnswer);
    } else return [];
  }, [data]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full text-sm max-w-7xl mx-auto p-4 sm:p-6">
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          className="flex items-center gap-x-2"
          onClick={() => router.back()}
        >
          <MdNavigateBefore size={22} />
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
            metric={`${data?.quizStatistics?.totalParticipants ?? 0}`}
          />
          <MetricCard
            title="Completion Rate"
            subTitle="Percentage of participants who completed the quiz"
            metric={`${(data?.quizStatistics?.completionRate ?? 0).toFixed(
              0
            )}%`}
          />
          <MetricCard
            title="Avg time to complete the quiz"
            subTitle="Avg time taken for participants to complete the quiz"
            metric={`${(
              (data?.quizStatistics?.avgCompletionTime ?? 0) / 1000
            ).toFixed(0)} Sec`}
          />
          <MetricCard
            title="Total Points Allocated"
            subTitle="Total number of points allocated to the quiz"
            metric={`${formatReviewNumber(
              data?.quizStatistics?.totalAllocatedPoints ?? 0
            )}`}
          />
        </div>
        <div className="w-full flex flex-col items-start gap-4">
          <MetricCard
            title="Active Participants"
            subTitle="Participants that attempted 50% of the question"
            metric={`${(data?.quizStatistics?.activeParticipants ?? 0).toFixed(
              0
            )}`}
          />
          <MetricCard
            title="Total Questions"
            subTitle="Number of questions available to be answered"
            metric={`${data?.quizStatistics?.totalQuestions ?? 0}`}
          />
          <MetricCard
            title="Avg time to answer a question"
            subTitle="Avg time taken for participants to answer each question"
            metric={`${(
              (data?.quizStatistics?.avgTimeToAnswerQuestion ?? 0) / 1000
            ).toFixed(0)} Sec`}
          />
          <MetricCard
            title="Avg Points"
            subTitle="Avg points gotten by participants"
            metric={`${(
              data?.quizStatistics?.avgPointGottenByParticipant ?? 0
            ).toFixed(0)}`}
          />
        </div>
        <div className="w-full h-[430px] bg-white rounded-lg py-6 px-4  ">
          <h2 className="font-semibold text-base sm:text-lg mb-4">
            Participants Engagement
          </h2>

          <ResponsiveContainer width="100%" maxHeight={350}>
            <LineChart width={500} height={340} data={data?.quizEngagement}>
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis
                dataKey="questionNumber"
                label={{ value: "Question", position: "insideBottom", dy: 10 }}
              />
              <YAxis
                label={{
                  value: "No. of Participants",
                  angle: -90,
                  position: "insideLeft",
                  dy: 50,
                }}
              />
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
