"use client";

import { EmptyQuizQuestionIcon, SettingsIcon } from "@/constants";
import { QuizLayout } from "../_components/QuizLayout";
import { Button } from "@/components/custom";
import { LeadingHeadRoute, TrailingHeadRoute } from "../_components";
import { useGetData } from "@/hooks/services/requests";
import { LoadingState } from "@/components/composables/LoadingState";
import { TQuestion, TQuiz } from "@/types/quiz";
import { AddQuestion } from "./AddQuestion";
import { useState } from "react";

export default function AddQuizQuestions({
  quizId,
  workspaceAlias,
}: {
  quizId: string;
  workspaceAlias: string;
}) {
  const { data, isLoading } = useGetData<TQuiz<TQuestion[]>>(
    `engagements/quiz/${quizId}`
  );
  const [question, setQuestion] = useState<TQuestion | null>(null)

  function editQuestion(q: TQuestion) {
    setQuestion(q)
  }
  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <QuizLayout
    className="overflow-y-auto"
      LeadingWidget={<LeadingHeadRoute name={data?.coverTitle ?? ""} />}
      TrailingWidget={
        <TrailingHeadRoute Icon={SettingsIcon} title="Quiz Settings" />
      }
    >
      <AddQuestion question={question} interactionType=""/>
      {/* {(!data?.questions ||
        (Array.isArray(data?.questions) && data?.questions?.length === 0)) && (
        <EmptyQuestion />
      )} */}
    </QuizLayout>
  );
}

function EmptyQuestion() {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-5">
      <EmptyQuizQuestionIcon />
      <h2 className="font-semibold text-base sm:text-lg mt-5">
        Your Quiz is Empty
      </h2>
      <Button className="bg-basePrimary h-11 text-white font-medium">
        Add Question
      </Button>
    </div>
  );
}
