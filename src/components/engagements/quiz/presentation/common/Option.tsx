"use client";

import { cn } from "@/lib/utils";
import { TAnswer, TQuiz, TQuestion } from "@/types/quiz";
import Image from "next/image";
import { useMemo } from "react";

type TOption = {
  optionId: string;
  isAnswer: string;
  option?: any;
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
  isImageOption,
}: {
  optionIndex: string;
  option: TOption;
  selectOption?: (id: string) => void;
  isAttendee?: boolean;
  answer: TAnswer[];
  showAnswerMetric?: boolean;
  setIsOptionSelected?: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
  quiz: TQuiz<TQuestion[]>;
  isImageOption: boolean;
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
          isImageOption={isImageOption}
        />
      ) : isImageOption ? (
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
            "w-fit  text-gray-600 gap-3 flex flex-col items-center p-2 h-fit rounded-lg  bg-basePrimary-100",
            typeof option?.isCorrect === "boolean" &&
              option?.isCorrect &&
              showAnswerMetric &&
              "bg-green-500 text-white",
            typeof option?.isCorrect === "boolean" &&
              !option?.isCorrect &&
              showAnswerMetric &&
              "bg-red-500 text-white",

            isCorrectAnswer &&
              showAnswerMetric &&
              "bg-green-500 text-white transform quiz-option-animation",
            typeof option?.isCorrect === "boolean" &&
              !showAnswerMetric &&
              "bg-[#001fcc] text-white"
          )}
        >
          <span
            className={cn(
              "rounded-lg h-9 flex items-center text-gray-600 justify-center font-medium w-9 bg-white border border-gray-700",
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
          <div className="w-full flex items-center justify-between">
            {showAnswerMetric && (
              <div className="w-11/12 relative h-2 rounded-3xl bg-gray-200">
                <span
                  style={{
                    width: chosedOption
                      ? `${((chosedOption / answer?.length) * 100).toFixed(0)}%`
                      : "0%",
                  }}
                  className={cn(
                    "absolute rounded-3xl bg-[#001fcc] inset-0  h-full",
                    option?.isCorrect !== "default" &&
                      !option?.isCorrect &&
                      "bg-red-500",
                    option?.isCorrect !== "default" &&
                      option?.isCorrect &&
                      "bg-green-500"
                  )}
                ></span>
              </div>
            )}

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
            "w-full px-4 text-gray-600 space-y-1 mb-4  min-h-[60px] h-fit rounded-lg  bg-basePrimary-100",
            typeof option?.isCorrect === "boolean" &&
              option?.isCorrect &&
              showAnswerMetric &&
              "bg-green-500 text-white",
            typeof option?.isCorrect === "boolean" &&
              !option?.isCorrect &&
              showAnswerMetric &&
              "bg-red-500 text-white",

            isCorrectAnswer &&
              showAnswerMetric &&
              "bg-green-500 text-white transform quiz-option-animation",
            typeof option?.isCorrect === "boolean" &&
              !showAnswerMetric &&
              "bg-[#001fcc] text-white"
          )}
        >
          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center gap-x-2">
              <span
                className={cn(
                  "rounded-lg h-9 flex items-center text-gray-600 justify-center font-medium w-9 bg-white border border-gray-700",
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
            <div className="w-full relative h-2 rounded-3xl bg-gray-200">
              <span
                style={{
                  width: chosedOption
                    ? `${((chosedOption / answer?.length) * 100).toFixed(0)}%`
                    : "0%",
                }}
                className={cn(
                  "absolute rounded-3xl inset-0 bg-[#001fcc] h-full",
                  option?.isCorrect !== "default" &&
                    !option?.isCorrect &&
                    "bg-red-500",
                  option?.isCorrect !== "default" &&
                    option?.isCorrect &&
                    "bg-green-500"
                )}
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
  isImageOption,
}: {
  optionIndex: string;
  option: string;
  showAnswerMetric?: boolean;
  chosen?: string;
  isCorrectAnswer?: boolean;
  isCorrect?: boolean;
  quiz?: TQuiz<TQuestion[]>;
  optionId?: string;
  isImageOption: boolean;
}) {
  return (
    <>
      {isImageOption ? (
        <button
          className={cn(
            "w-fit text-gray-500   h-fit rounded-lg p-2 flex flex-col items-center gap-3 bg-basePrimary-100",
            (isCorrect && isCorrectAnswer) ||
              (quiz?.accessibility?.live &&
                quiz?.liveMode?.correctOptionId === optionId &&
                "bg-green-500 text-white transform quiz-option-animation")
          )}
        >
          <span
            className={cn(
              "rounded-lg h-10 flex items-center justify-center font-medium w-10 bg-white border border-gray-700",
              (isCorrect && isCorrectAnswer) ||
                (quiz?.accessibility?.live &&
                  quiz?.liveMode?.correctOptionId === optionId &&
                  "text-green-500")
            )}
          >
            {optionIndex}
          </span>
          <div className="w-full flex items-center justify-between">
            {showAnswerMetric && (
              <div className="w-11/12 relative h-1 rounded-3xl bg-gray-200">
                <span
                  style={{
                    width: `${chosen || 0}%`,
                  }}
                  className="absolute rounded-3xl inset-0 bg-[#001fcc] h-full"
                ></span>
              </div>
            )}
            {showAnswerMetric && (
              <div className="text-mobile">
                <span>{`${chosen || 0}%`}</span>
              </div>
            )}
          </div>
          <Image
            src={option}
            alt=""
            width={400}
            height={400}
            className="w-32 rounded-lg object-cover h-32"
          />
        </button>
      ) : (
        <button
          className={cn(
            "w-full px-4 text-gray-500 gap-y-1 mb-4  min-h-[60px] h-fit rounded-lg  bg-basePrimary-100",
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
                  "rounded-lg h-10 flex items-center justify-center font-medium w-10 bg-white border border-gray-700",
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
      )}
    </>
  );
}
