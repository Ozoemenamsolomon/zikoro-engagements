"use client";

import { cn } from "@/lib/utils";
import { TAnswer, TQuiz, TQuestion } from "@/types/quiz";
import { useMemo } from "react";

type TOption = {
  optionId: string;
  isAnswer: string;
  option: string;
  isCorrect: boolean | string;
};
export function Option({
  optionIndex,
  option,
  selectOption,
  setIsOptionSelected,
  isAttendee,
  answer,
  showAnswerMetric,
  isDisabled,
  quiz,
}: {
  optionIndex: string;
  option: TOption;
  selectOption?: (id: string) => void;
  isAttendee?:boolean;
  answer: TAnswer[];
  showAnswerMetric?: boolean;
  setIsOptionSelected?: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
  quiz: TQuiz<TQuestion[]>;
}) {
  const chosedOption = useMemo(() => {
    const i = answer?.filter((ans) => {
      return option?.optionId === ans?.selectedOptionId?.optionId;
    });

    return i?.length || 0;
  }, [answer]);

  const isCorrectAnswer = useMemo(() => {
    return option?.isAnswer === option?.optionId;
  }, [option]);

  //  console.log(isCorrectAnswer, { isCorrect: option?.isCorrect });

  return (
    <>
      {!isAttendee ? (
        <OrganizerQuestOption
          optionIndex={optionIndex}
          option={option?.option ?? ""}
          showAnswerMetric={showAnswerMetric}
          chosen={((chosedOption / answer?.length) * 100).toFixed(0)}
          isCorrect={typeof option?.isCorrect === "boolean"}
          isCorrectAnswer={isCorrectAnswer}
          quiz={quiz}
          optionId={option?.optionId}
        />
      ) : (
        <button
          disabled={isDisabled}
          onClick={() => {
            if (selectOption) {
              selectOption(option?.optionId);
            }
            if (setIsOptionSelected) {
              setIsOptionSelected(true);
            }
          }}
          className={cn(
            "w-full px-4 text-gray-600 space-y-1  min-h-[60px] h-fit rounded-lg  bg-basePrimary-100",
            typeof option?.isCorrect === "boolean" &&
              option?.isCorrect &&
              showAnswerMetric &&
              "bg-green-500 text-white",
            typeof option?.isCorrect === "boolean" &&
              !option?.isCorrect &&
              showAnswerMetric &&
              "bg-red-500 text-hwite",

            isCorrectAnswer &&
              showAnswerMetric &&
              "bg-green-500 text-white transform quiz-option-animation",
            typeof option?.isCorrect === "boolean" &&
              !showAnswerMetric &&
              "bg-[#001fcc] text-white"
          )}
        >
          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-start gap-x-2">
              <span
                className={cn(
                  "rounded-lg h-9 flex items-center justify-center font-medium w-9 bg-white border border-gray-700",
                  option?.isCorrect !== "default" &&
                    showAnswerMetric &&
                    option?.isCorrect &&
                    "text-green-500",
                  option?.isCorrect !== "default" &&
                    showAnswerMetric &&
                    !option?.isCorrect &&
                    "text-red-500"
                )}
              >
                {optionIndex}
              </span>

              <div
                className="innerhtml"
                dangerouslySetInnerHTML={{
                  __html: option?.option ?? "",
                }}
              />
            </div>

            {showAnswerMetric && (
              <div className="text-mobile">
                <span>
                  {chosedOption
                    ? `${((chosedOption / answer?.length) * 100).toFixed(0)}%`
                    : "0%"}
                </span>
              </div>
            )}
          </div>

          {showAnswerMetric && (
            <div className="w-full relative h-1 rounded-3xl bg-gray-200">
              <span
                style={{
                  width: chosedOption
                    ? `${((chosedOption / answer?.length) * 100).toFixed(0)}%`
                    : "0%",
                }}
                className="absolute rounded-3xl inset-0 bg-basePrimary h-full"
              ></span>
            </div>
          )}
        </button>
      )}
    </>
  );
}

export function OrganizerQuestOption({
  optionIndex,
  option,
  showAnswerMetric,
  chosen,
  isCorrectAnswer,
  isCorrect,
  quiz,
  optionId,
}: {
  optionIndex: string;
  option: string;
  showAnswerMetric?: boolean;
  chosen?: string;
  isCorrectAnswer?: boolean;
  isCorrect?: boolean;
  quiz?: TQuiz<TQuestion[]>;
  optionId?: string;
}) {
  return (
    <button
      className={cn(
        "w-full px-4 text-gray-500 gap-y-1  min-h-[44px] h-fit rounded-md border border-gray-500 bg-gray-100",
        (isCorrect && isCorrectAnswer) ||
          (quiz?.accessibility?.live &&
            quiz?.liveMode?.correctOptionId === optionId &&
            "bg-green-500 text-white transform quiz-option-animation")
      )}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <span
            className={cn(
              "rounded-lg h-11 flex items-center justify-center font-medium w-11 bg-white border border-gray-700",
              (isCorrect && isCorrectAnswer) ||
                (quiz?.accessibility?.live &&
                  quiz?.liveMode?.correctOptionId === optionId &&
                  "text-green-500")
            )}
          >
            {optionIndex}
          </span>

          <div
            className="innerhtml"
            dangerouslySetInnerHTML={{
              __html: option ?? "",
            }}
          />
        </div>
        {showAnswerMetric && (
          <div className="text-mobile">
            <span>{`${chosen || 0}%`}</span>
          </div>
        )}
      </div>
      {showAnswerMetric && (
        <div className="w-full relative h-1 rounded-3xl bg-gray-200">
          <span
            style={{
              width: `${chosen || 0}%`,
            }}
            className="absolute rounded-3xl inset-0 bg-[#001fcc] h-full"
          ></span>
        </div>
      )}
    </button>
  );
}
