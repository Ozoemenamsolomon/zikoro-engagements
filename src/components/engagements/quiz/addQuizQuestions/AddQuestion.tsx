"use-client";

import { Button, TextEditor } from "@/components/custom";
import { RangeModal, TopSection } from "./_components";
import { QuestionField } from "./_components/QuestionField";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { OptionType, TQuestion, TQuiz } from "@/types/quiz";
import { TextOptions } from "./_components/options/TextOptions";
import { ImageOptions } from "./_components/options/ImageOptions";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { quizQuestionSchema } from "@/schemas/quiz";
import { nanoid } from "nanoid";
import {toast} from "react-toastify";
import { uploadFile } from "@/utils";
import { usePostRequest } from "@/hooks/services/requests";
import { LoaderAlt } from "styled-icons/boxicons-regular";

function FeedbackWidget({
  defaultFeedBackValue,
  question,
  form,
}: {
  defaultFeedBackValue: string;
  question: TQuestion | null;
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <>
      { (
        <div className="w-full" id="select-feedback">
          {isFocused ? (
            <div className="w-full">
              <TextEditor
                defaultValue={defaultFeedBackValue}
                placeholder="Enter your Feedback"
                onChange={(value) => {
                  form.setValue("feedBack", value);
                }}
              //  key={defaultFeedBackValue}
                onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
              />
            </div>
          ) : (
            <div
              onClick={() => setIsFocused(true)}
              className="innerhtml w-full p-3 rounded-lg bg-basePrimary-100"
              dangerouslySetInnerHTML={{
                __html: defaultFeedBackValue || "Enter Your Feedback",
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

export function AddQuestion({
  question,
  interactionType,
  quiz,
  workspaceAlias,
  refetch,
  editQuestion,
}: {
  interactionType?: string;
  question: TQuestion | null;
  quiz: TQuiz<TQuestion[]>;
  workspaceAlias: string;
  refetch: () => Promise<any>;
  editQuestion: (t: TQuestion | null) => void;
}) {
  const [optionType, setOptionType] = useState<OptionType | null>(null);
  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("/engagements/quiz");
  const [isOpenDurationModal, setIsOpenDurationModal] = useState(false);
  const [isOpenPointModal, setIsOpenPointModal] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleDuration() {
    setIsOpenDurationModal((prev) => !prev);
  }
  function togglePoint() {
    setIsOpenPointModal((prev) => !prev);
  }

  const form = useForm<z.infer<typeof quizQuestionSchema>>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      options: [{ optionId: nanoid(), option: "", isAnswer: "" }],
      duration: "10",
      points: "10",
    },
  });

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "options",
  });

  function appendOption() {
    console.log("appending");
    append([
      {
        optionId: nanoid(),
        option: "",
        isAnswer: "",
      },
    ]);
  }

  async function onSubmit(values: z.infer<typeof quizQuestionSchema>) {
    if (!quiz) return;
    const isCorrectAnswerNotSelected = values?.options?.every(
      (value) => value?.isAnswer?.length <= 0
    );
    if (isCorrectAnswerNotSelected && quiz?.interactionType !== "poll") {
      toast.error("You have not selected the correct answer");
      return;
    }
    setLoading(true);

    const image = await new Promise(async (resolve) => {
      if (typeof values?.questionImage === "string") {
        resolve(values?.questionImage);
      } else if (values?.questionImage && values?.questionImage[0]) {
        const img = await uploadFile(values?.questionImage[0], "image");
        resolve(img);
      } else {
        resolve(null);
      }
    });
    const refinedOption = await Promise.all(
      values?.options?.map(async (option) => {
        if (typeof option.option === "string") {
          return option;
        } else if (option.option && option.option[0]) {
          const img = await uploadFile(option.option[0], "image");
          return { ...option, option: img };
        }
        return option;
      })
    );
    const updatedQuestion = {
      ...values,
      options: refinedOption,
      id: nanoid(),
      questionImage: image as string,
    };
    // filter question
    const filteredQuestion = quiz?.questions?.filter(
      ({ id }) => id !== question?.id
    );
    const editingQuestion = quiz?.questions?.find(
      ({ id }) => id === question?.id
    );
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      interactionType: "quiz",
      questions:
        quiz?.questions?.length > 0
          ? editingQuestion?.id
            ? [
                ...filteredQuestion,
                {
                  ...editingQuestion,
                  ...values,
                  options: refinedOption,
                  questionImage: image as string,
                },
              ]
            : [...quiz?.questions, { ...updatedQuestion }]
          : [{ ...updatedQuestion }],
      totalDuration:
        quiz?.totalDuration > 0
          ? Number(quiz?.totalDuration) + Number(values?.duration || 0)
          : Number(values?.duration || 0),
      totalPoints:
        quiz?.totalDuration > 0
          ? Number(quiz?.totalPoints) + Number(values?.points || 0)
          : Number(values?.points || 0),
      lastUpdated_at: new Date().toISOString(),
    };
    await postData({ payload });

    setLoading(false);
    editQuestion(null);
    if (refetch) refetch();
  }

  const questionImg = form.watch("questionImage");
  const addedImage = useMemo(() => {
    if (typeof questionImg === "string") {
      return questionImg;
    } else if (questionImg && questionImg[0]) {
      return URL.createObjectURL(questionImg[0]);
    } else {
      return null;
    }
  }, [questionImg]);

  const questionValue = form.watch("question");
  const feedBackValue = form.watch("feedBack");
  const currentDuration = form.watch("duration");
  const currentPoint = form.watch("points");

  const defaultQuestionValue = useMemo(() => {
    if (typeof questionValue === "string" && questionValue?.length > 0) {
      return questionValue;
    } else {
      return "";
    }
  }, [questionValue, question]);

  const defaultFeedBackValue = useMemo(() => {
    if (typeof feedBackValue === "string" && feedBackValue?.length > 0) {
      return feedBackValue;
    } else {
      return "";
    }
  }, [feedBackValue, question]);

  useEffect(() => {
    if (interactionType) {
      form.setValue("interactionType", interactionType);
    }
  }, [interactionType]);

  useEffect(() => {
    if (question) {
      form.reset({
        question: question?.question,
        questionImage: question?.questionImage,
        duration: question?.duration,
        points: question?.points,
        feedBack: question?.feedBack,
        options: question?.options,
        interactionType: question?.interactionType,
      });
    }
  }, [question]);

  useEffect(() => {
    if (question) {
      setOptionType(
        question?.options?.some((opt) => opt.option?.startsWith("https://"))
          ? OptionType.image
          : OptionType.text
      );
    }
  }, [question]);

  const questionIndex = useMemo(() => {
    if (question && quiz) {
      return quiz?.questions?.findIndex((v) => v?.id === question?.id) + 1;
    } else if (quiz?.questions !== null) return quiz?.questions?.length + 1;
    else return 1;
  }, [question, quiz]);

 // console.log(form.formState.errors);

  return (
    <>
      <div className="w-full px-4 sm:px-6 pt-4 sm:pt-6  h-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <TopSection
            points={currentPoint}
            duration={currentDuration}
            changeDuration={toggleDuration}
            changePoint={togglePoint}
          />

          <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="w-full flex flex-col  gap-1 items-center">
              <p className="font-medium">Question:</p>
              <p className="w-14 h-14 flex text-2xl items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                {questionIndex}
              </p>
            </div>
            <QuestionField
              defaultQuestionValue={defaultQuestionValue}
              question={question}
              form={form}
              addedImage={addedImage}
              quiz={quiz}
              refetch={async () => {
                editQuestion(null);
                refetch();
              }}
            />

            <div className="my-6 flex flex-col items-start justify-start gap-3">
              {optionType === null ? (
                <p className="font-medium text-basePrimary">Add Option</p>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOptionType(null);
                    form.setValue("options", [
                      { optionId: nanoid(), option: "", isAnswer: "" },
                    ]);
                  }}
                  className="flex items-center gap-x-1"
                >
                  <InlineIcon
                    icon="pepicons-print:repeat-circle-filled"
                    fontSize={16}
                  />
                  <p>Change Option Type</p>
                </button>
              )}
              {optionType === null && (
                <div className="border p-3 gap-4 rounded-lg flex flex-col">
                  <p className="text-center max-w-[60%] self-center">
                    Choose option type for this question
                  </p>

                  <div className="flex items-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOptionType(OptionType.text);
                      }}
                      className={cn(
                        "w-[140px] rounded-lg h-[150px] px-0",
                        optionType === OptionType.text &&
                          "border border-basePrimary"
                      )}
                    >
                      <Image
                        src="/text-type.svg"
                        alt="img-type"
                        width="116"
                        height="128"
                      />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOptionType(OptionType.image);
                      }}
                      className={cn(
                        "w-[140px] rounded-lg h-[150px] px-0",
                        optionType === OptionType.image &&
                          "border border-basePrimary"
                      )}
                    >
                      <Image
                        src="/image-type.svg"
                        alt="img-type"
                        width="136"
                        height="148"
                        className="object-contain"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {optionType !== null && (
              <div className="w-full mt-4">
                {OptionType.text === optionType && (
                  <TextOptions
                    appendOption={appendOption}
                    remove={remove}
                    fields={fields}
                    form={form}
                  />
                )}
                {OptionType.image === optionType && (
                  <ImageOptions
                    appendOption={appendOption}
                    remove={remove}
                    fields={fields}
                    form={form}
                  />
                )}
              </div>
            )}

            {interactionType !== "poll" && optionType !== null && (
              <div className="w-full mt-6">
                <FeedbackWidget
                  defaultFeedBackValue={defaultFeedBackValue}
                  question={question}
                  form={form}
                />
              </div>
            )}

            <div className="w-full my-10 flex gap-3 items-center justify-center">
              <Button className="h-11 bg-basePrimary rounded-lg gap-x-2 text-white font-medium">
                {loading && <LoaderAlt size={20} className="animate-spin" />}
                <p>Save Question</p>
              </Button>
            </div>
            <p className="w-1 h-1"></p>
          </div>
        </form>
      </div>
      {isOpenDurationModal && (
        <RangeModal
          form={form}
          value={Number(currentDuration)}
          close={toggleDuration}
          name="duration"
          max={120}
        />
      )}
      {isOpenPointModal && (
        <RangeModal
          form={form}
          value={Number(currentPoint)}
          close={togglePoint}
          name="points"
          max={1000}
        />
      )}
    </>
  );
}
