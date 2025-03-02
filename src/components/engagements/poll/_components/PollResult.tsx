"use client";

import { TAnswer, TQuiz, TRefinedQuestion } from "@/types/quiz";
import Image from "next/image";
import { AnsweredPollMetrics } from "../../quiz/presentation/organizer/_components";

function SinglePollResult({
  answer,
  index,
  currentQuestion,
}: {
  currentQuestion: TRefinedQuestion;
  index: number;
  answer: TAnswer[];
}) {
  return (
    <div className="w-full flex flex-col gap-3 max-w-2xl mx-auto">
      <div className="w-full  flex flex-col items-center gap-6">
        <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
          {index + 1}
        </p>

        <div
          className="innerhtml mx-auto w-fit"
          dangerouslySetInnerHTML={{
            __html: currentQuestion?.question ?? "",
          }}
        />

        {currentQuestion?.questionImage ? (
          <Image
            className="w-52 sm:w-72 rounded-md h-48 sm:h-52 object-cover"
            alt="quiz"
            src={currentQuestion?.questionImage}
            width={400}
            height={400}
          />
        ) : (
          <div className="w-1 h-1"></div>
        )}
      </div>

      <AnsweredPollMetrics
        options={currentQuestion?.options!}
        answer={answer}
      />
    </div>
  );
}

export function PollResult({
  quizResult,
  answer,
}: {
  answer: TAnswer[];
  quizResult: TQuiz<TRefinedQuestion[]>;
}) {
  return (
    <div className="w-full inset-0 fixed overflow-y-auto vert-scroll h-full ">
      {quizResult?.questions?.map((quest, index) => {
        const currentQuestion = quizResult?.questions[index];
        return (
          <SinglePollResult
            index={index}
            currentQuestion={currentQuestion}
            answer={answer}
          />
        );
      })}
    </div>
  );
}
