"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useDeleteRequest,
  useGetData,
  usePostRequest,
} from "@/hooks/services/requests";
import { TQuiz, TQuestion, TAnswer, TRefinedQuestion } from "@/types/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyQuizQuestionIcon, PeopleIcon } from "@/constants";
import { formatReviewNumber } from "@/utils";
import { MetricCard } from "../../_components";
import { Button } from "@/components/custom";
import { ActionModal } from "@/components/custom/ActionModal";
import { generateRandomColor } from "../../form/formResponse/responseTypes";

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
  selectionPercentage: number;
};

export type TEngagementAnalytics = {
  questionId: string;
  questionText: string;
  totalDuration: number;
  options: QuestionOption[];
  averageAnswerTimePerAttendee: {
    attendeeName: string;
    averageAnswerTime: number;
  }[];
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
      totalDuration: number;
      options: TRefinedQuestion["options"];
      attendeeDurations: Map<string, number[]>;
    }
  >();

  // Process each answer
  answers.forEach((answer) => {
    const {
      questionId,
      answeredQuestion,
      selectedOptionId,
      answerDuration,
      attendeeName,
      maxDuration,
    } = answer;
    const questionText = answeredQuestion.question;
    const selectedOption = selectedOptionId.optionId;

    if (!questionMap.has(questionId)) {
      questionMap.set(questionId, {
        questionText,
        totalResponses: 0,
        totalDuration: 0,
        optionsCount: new Map(),
        options: answeredQuestion.options,
        attendeeDurations: new Map(),
      });
    }

    const questionData = questionMap.get(questionId)!;
    questionData.totalResponses++;
    // there is inconsistency in the data - maxDuration is in Sec, while answerDuration is in MilliSec
    questionData.totalDuration += maxDuration * 1000 - answerDuration;
    console.log(maxDuration * 1000 - answerDuration);

    // Increment the count for the selected option
    questionData.optionsCount.set(
      selectedOption,
      (questionData.optionsCount.get(selectedOption) || 0) + 1
    );

    // Track each attendee's response duration
    if (!questionData.attendeeDurations.has(attendeeName)) {
      questionData.attendeeDurations.set(attendeeName, []);
    }
    questionData.attendeeDurations
      .get(attendeeName)!
      .push(maxDuration * 1000 - answerDuration);
  });

  // Transform into output format
  return Array.from(questionMap.entries()).map(
    ([
      questionId,
      {
        questionText,
        optionsCount,
        totalResponses,
        totalDuration,
        options,
        attendeeDurations,
      },
    ]) => ({
      questionId,
      questionText,
      totalDuration,
      options: options.map((option) => ({
        ...option,
        selectionPercentage:
          totalResponses > 0
            ? ((optionsCount.get(option.optionId) || 0) / totalResponses) * 100
            : 0,
      })),
      averageAnswerTimePerAttendee: Array.from(attendeeDurations.entries()).map(
        ([attendeeName, durations]) => ({
          attendeeName,
          averageAnswerTime:
            durations.length > 0
              ? durations.reduce((sum, time) => sum + time, 0) /
                durations.length
              : 0,
        })
      ),
    })
  );
}

function QuestOption({
  option,
  index,
  colors,
}: {
  option: QuestionOption;
  index: number;
  colors: string[];
}) {
  const isImageOption = (option?.option as string)?.startsWith("https://");
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="w-[60px] h-full flex flex-col items-center gap-2">
      <div className="h-[280px] w-[60px] sm:w-[90px]">
        <div
          style={{
            backgroundColor: colors[index],
            height: option?.selectionPercentage
              ? `${option?.selectionPercentage.toFixed(0)}%`
              : "0%",
          }}
          className="w-full flex flex-col items-center justify-center rounded-t-lg"
        >
          {option?.selectionPercentage > 0 && (
            <div className="bg-white/50 rounded-3xl px-3 py-2 flex gap-1 flex-col items-center justify-center">
              {`${option?.selectionPercentage.toFixed(0)}%`}
              <p className="text-xs flex items-center gap-x-1">
                <InlineIcon icon="mdi:users" fontSize={16} />
                <span>{option?.selectionPercentage}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <p>{optionLetters[index]}</p>
    </div>
  );
}

function PollEngagementInsight({
  analytics,

  totalParticipants,
}: {
  analytics: TEngagementAnalytics[];

  totalParticipants: number;
}) {
  const [activeAnalytics, setActiveAnalytics] =
    useState<TEngagementAnalytics | null>(analytics[0]);
  const [currentIndex, setCurrentIndex] = useState(1);

  const isImageOption = useMemo(() => {
    if (Array.isArray(activeAnalytics?.options)) {
      return activeAnalytics?.options?.some((s) =>
        s.option.startsWith("https://")
      );
    } else return false;
  }, [activeAnalytics]);

  const avg = useMemo(() => {
    if (activeAnalytics)
      return (
        activeAnalytics?.totalDuration /
        (1000 * activeAnalytics?.averageAnswerTimePerAttendee?.length)
      ).toFixed(0);
    else return 0;
  }, [activeAnalytics]);

  const colors = useMemo(() => {
    return activeAnalytics?.options?.map((r) => generateRandomColor());
  }, [activeAnalytics?.options]);
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
              {Array.isArray(analytics) &&
                analytics?.map((analytic, index) => {
                  return (
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
                  );
                })}
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
                  {avg} Secs
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

              <div
                className={cn(
                  "w-full flex flex-col items-start justify-start gap-1",
                  isImageOption &&
                    "flex-row flex-wrap gap-3 justify-center items-center"
                )}
              >
                <div className="w-full h-[350px] flex items-start gap-x-3 justify-center">
                  {activeAnalytics?.options?.map((option, index) => {
                    return (
                      <QuestOption
                        key={index}
                        colors={colors ?? []}
                        index={index}
                        option={option}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PollAnalytics({ pollId }: { pollId: string }) {
  const router = useRouter();
  const { data, isLoading } = useGetData<TQuizResponse>(
    `engagements/quiz/${pollId}/analytics`
  );
  const { deleteData } = useDeleteRequest(`engagements/quiz/answer/${pollId}`);
  const { postData: updateQuiz } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [isToClear, setIsToClear] = useState(false);
  const [isLoadingClear, setIsLoadingClear] = useState(false);

  const engagementInsight = useMemo(() => {
    if (
      data &&
      Array.isArray(data?.quiz?.questions) &&
      Array.isArray(data?.quizAnswer)
    ) {
      return calculateOptionSelectionPercentage(data?.quizAnswer);
    } else return [];
  }, [data]);

  console.log({ engagementInsight });

  function onToggleClear() {
    setIsToClear((prev) => !prev);
  }

  // clear record
  async function clearRecord() {
    setIsLoadingClear(true);

    // delete all answers for a quiz
    await deleteData();

    // delete all the participant for a quiz
    await updateQuiz({
      payload: {
        ...data?.quiz,
        quizParticipants: [],
      },
    });

    setIsLoadingClear(false);
    onToggleClear();
    router.back();
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="w-full text-sm max-w-7xl mx-auto p-4 sm:p-6">
        <div className="w-full mb-6 flex items-center justify-between">
          <button
            className="flex items-center gap-x-2"
            onClick={() => router.back()}
          >
            <InlineIcon
              icon="material-symbols:arrow-back-rounded"
              fontSize={22}
            />
            <p className="text-sm hidden sm:block">{data?.quiz?.coverTitle}</p>
          </button>
          <h2 className="font-semibold text-lg sm:text-base">Analytics</h2>
          <Button
            onClick={() => {
              onToggleClear();
            }}
            className="flex w-fit bg-basePrimary items-center rounded-lg h-10  gap-x-2"
          >
            <InlineIcon
              icon="mingcute:delete-line"
              fontSize={18}
              color="#ffffff"
            />
            <p className="text-white font-medium">Delete Record</p>
          </Button>
        </div>
        <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
          Overview
        </h2>
        <div className="w-full grid grid-cols-1  md:grid-cols-3 gap-4">
          <div className="w-full flex  flex-col items-start gap-4">
            <MetricCard
              title="Total Questions"
              subTitle="Number of questions available to be answered"
              metric={`${data?.quizStatistics?.totalQuestions ?? 0}`}
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
          </div>
          <div className="w-full flex flex-col items-start gap-4">
            <MetricCard
              title="Total Participants"
              subTitle="Number of people that participated"
              metric={`${data?.quizStatistics?.totalParticipants ?? 0}`}
            />
            <MetricCard
              title="Active Participants"
              subTitle="Participants that attempted 50% of the question"
              metric={`${(
                data?.quizStatistics?.activeParticipants ?? 0
              ).toFixed(0)}`}
            />

            <MetricCard
              title="Avg time to answer a question"
              subTitle="Avg time taken for participants to answer each question"
              metric={`${(
                (data?.quizStatistics?.avgTimeToAnswerQuestion ?? 0) / 1000
              ).toFixed(0)} Sec`}
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
                  label={{
                    value: "Question",
                    position: "insideBottom",
                    dy: 10,
                  }}
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

        <PollEngagementInsight
          analytics={engagementInsight}
          key={engagementInsight.length}
          totalParticipants={data?.quizStatistics?.totalParticipants}
        />
      </div>
      {isToClear && (
        <ActionModal
          loading={isLoadingClear}
          close={onToggleClear}
          asynAction={clearRecord}
          buttonText="Delete"
          buttonColor="text-white bg-red-500"
          titleColor="text-red-500"
          modalTitle="Delete Quiz Record"
          title="Clear Record"
          modalText="Participants records, scores and points will be deleted and can not be recovered."
        />
      )}
    </>
  );
}
