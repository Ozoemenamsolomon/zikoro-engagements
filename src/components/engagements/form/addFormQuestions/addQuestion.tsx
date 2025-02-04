"use client";

import { Button } from "@/components/custom";
import { formQuestion } from "@/schemas";
import { TEngagementFormQuestion } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { z } from "zod";
import {
  FormCheckBoxType,
  FormDateType,
  FormRatingType,
  FormTextType,
  FormUploadType,
  FormImageUploadType,
} from "./_components";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePostRequest } from "@/hooks/services/requests";
import { generateAlias, uploadFile } from "@/utils";

const options = [
  {
    name: "Mutiple Choice",
    image: "/fmultiplechoice.png",
    type: "INPUT_MULTIPLE_CHOICE",
  },
  { name: "Text", image: "/ftext.png", type: "INPUT_TEXT" },
  { name: "Date", image: "/fdate.png", type: "INPUT_DATE" },
  { name: "CheckBox", image: "/fcheckbox.png", type: "INPUT_CHECKBOX" },
  { name: "Rating", image: "/fstarr.png", type: "INPUT_RATING" },
  { name: "Upload", image: "/fattachment.png", type: "ATTACHMENT" },
  { name: "Picture Choice", image: "/fpicture.png", type: "PICTURE_CHOICE" },
];
// { name: "Likert", image: "/flikert.png" },

const optionsType = [
  { name: "Mutiple Choice", type: "INPUT_MULTIPLE_CHOICE" },
  { name: "Text", type: "INPUT_TEXT" },
  { name: "Date", type: "INPUT_DATE" },
  { name: "CheckBox", type: "INPUT_CHECKBOX" },
  { name: "Rating", type: "INPUT_RATING" },
  { name: "Upload", type: "ATTACHMENT" },
];

export function AddQuestion({
  question,
  refetch,
  editQuestion,
  engagementForm,
  workspaceAlias,
}: {
  engagementForm: TEngagementFormQuestion;
  workspaceAlias: string;
  question: TEngagementFormQuestion["questions"][number] | null;
  refetch: () => Promise<any>;
  editQuestion: (
    t: TEngagementFormQuestion["questions"][number] | null
  ) => void;
}) {
  const form = useForm<z.infer<typeof formQuestion>>({
    resolver: zodResolver(formQuestion),
    defaultValues:{
      questionId: generateAlias()
    }
  });
  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const [optionType, setOptionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function onSubmit(values: z.infer<typeof formQuestion>) {

    
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
        


  }

  const questionImg = form.watch("questionImage");
  // const addedImage = useMemo(() => {
  //   if (typeof questionImg === "string") {
  //     return questionImg;
  //   } else if (questionImg && questionImg[0]) {
  //     return URL.createObjectURL(questionImg[0]);
  //   } else {
  //     return null;
  //   }
  // }, [questionImg]);

  const questionValue = form.watch("question");
  const defaultQuestionValue = useMemo(() => {
    if (typeof questionValue === "string" && questionValue?.length > 0) {
      return questionValue;
    } else {
      return "";
    }
  }, [questionValue, question]);

  const questionIndex = useMemo(() => {
    if (question && engagementForm) {
      return (
        engagementForm?.questions?.findIndex(
          (v) => v?.questionId === question?.questionId
        ) + 1
      );
    } else if (engagementForm?.questions !== null)
      return engagementForm?.questions?.length + 1;
    else return 1;
  }, [question, engagementForm]);

  // async function deleteQuestion() {
  //   if (!question) return;
  //   setLoading(true);
  //   const filteredQuestion = engagementForm?.questions?.filter(
  //     (q) => q.questionId !== question.questionId
  //   );
  //   const payload: Partial<TEngagementFormQuestion> = {
  //     ...engagementForm,
  //     questions: filteredQuestion,
  //   };

  //   await postData({ payload });
  //   setLoading(false);
  //   refetch();
  // }

  return (
    <>
      <div className="w-full px-4 sm:px-6 pt-4 sm:pt-6  h-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="w-full flex flex-col  gap-1 items-center">
              <p className="font-medium">Question:</p>
              <p className="w-14 h-14 flex text-2xl items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                {questionIndex}
              </p>
            </div>
            {/* <FormQuestionField
              defaultQuestionValue={defaultQuestionValue}
              question={question}
              form={form}
              addedImage={addedImage}
              engagementForm={engagementForm}
              refetch={async () => {
                editQuestion(null);
                refetch();
              }}
            /> */}

            <div className="my-6 flex flex-col items-start justify-start gap-3">
              {optionType !== null && 
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOptionType(null);
                    // form.setValue("options", [
                    //   { optionId: nanoid(), option: "", isAnswer: "" },
                    // ]);
                  }}
                  className="flex items-center gap-x-1"
                >
                  <InlineIcon
                    icon="pepicons-print:repeat-circle-filled"
                    fontSize={16}
                  />
                  <p>Change Question Type</p>
                </button>
              }
              {optionType === null && (
                <div className="border p-3 gap-4 rounded-lg flex flex-col">
                  <p className="text-center max-w-[60%] self-center">
                    Choose question type for this form
                  </p>

                  <div className="w-full flex flex-wrap  items-center px-4 mx-auto max-w-[70%] gap-6 py-4 sm:py-8 justify-center">
                    {options?.map((item) => (
                      <button
                        onClick={() => setOptionType(item?.type)}
                        className={cn(
                          "w-full max-w-[170px] min-w-[170px] flex border hover:border-basePrimary border-gray-300 items-center gap-x-3 p-2 rounded-lg  sm:p-3"
                        )}
                      >
                        <Image
                          src={item.image}
                          alt="question-type"
                          width={18}
                          height={18}
                          className="object-cover"
                        />
                        <p>{item.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {optionType !== null && (
                <div className="w-full mt-4">
                  {optionType === "INPUT_TEXT" && (
                    <FormTextType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                    />
                  )}
                  {optionType === "INPUT_DATE" && (
                    <FormDateType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                    />
                  )}
                  {optionType === "INPUT_CHECKBOX" ||
                    (optionType === "INPUT_MULTIPLE_CHOICE" && (
                      <FormCheckBoxType
                        form={form}
                        engagementForm={engagementForm}
                        defaultQuestionValue={defaultQuestionValue}
                        question={question}
                        refetch={async () => {
                          refetch();
                          editQuestion(null);
                        }}
                      />
                    ))}

                  {optionType === "INPUT_RATING" && (
                    <FormRatingType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                    />
                  )}
                  {optionType === "ATTACHMENT" && (
                    <FormUploadType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="w-full my-10 flex gap-3 items-center justify-center">
              <Button className="h-11 bg-basePrimary rounded-lg gap-x-2 text-white font-medium">
                {true && <LoaderAlt size={20} className="animate-spin" />}
                <p>Save Question</p>
              </Button>
            </div>
            <p className="w-1 h-1"></p>
          </div>
        </form>
      </div>
    </>
  );
}
