"use client";

import { Button } from "@/components/custom";
import { formQuestion } from "@/schemas";
import { TEngagementFormQuestion } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useMemo, useState } from "react";
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
  FormAddressType,
  FormContactType,
  FormYesNoType,
} from "./_components";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePostRequest } from "@/hooks/services/requests";
import { generateAlias, uploadFile } from "@/utils";
import { FormBasicType } from "./_components/options/formBasicType";
import { toast } from "react-toastify";

export const options = [
  { name: "Text", image: "/ftext.png", type: "INPUT_TEXT" },
  { name: "Date", image: "/fdate.png", type: "INPUT_DATE" },
  { name: "CheckBox", image: "/fcheckbox.png", type: "INPUT_CHECKBOX" },
  { name: "Rating", image: "/fstarr.png", type: "INPUT_RATING" },
  { name: "Upload", image: "/fattachment.png", type: "ATTACHMENT" },
  { name: "Picture Choice", image: "/fpicture.png", type: "PICTURE_CHOICE" },
  { name: "Email", image: "/femail.svg", type: "INPUT_EMAIL" },
  { name: "Yes/No", image: "/fyes.svg", type: "YES_OR_NO" },
  { name: "Website", image: "/flink.svg", type: "WEBSITE" },
  { name: "Address", image: "/faddress.svg", type: "INPUT_ADDRESS" },
  { name: "Phone Number", image: "/fphone.svg", type: "PHONE_NUMBER" },
  { name: "Contact", image: "/fcontact.svg", type: "CONTACT" },
  { name: "Country", image: "/fcountry.svg", type: "COUNTRY" },
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
    defaultValues: {
      questionId: generateAlias(),
      isRequired: false,
      showDescription: false,
    },
  });

  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const [optionType, setOptionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function onSubmit(values: z.infer<typeof formQuestion>) {
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

    if (
      values.selectedType === "DROPDOWN" &&
      values.optionFields?.some((v: any) => v?.optionImage)
    ) {
      toast.error("A dropdown cannot have an image option");
      return;
    }

    // Process option fields if present
    let processedOptionFields = values.optionFields;
    if (values.optionFields && Array.isArray(values.optionFields)) {
      processedOptionFields = await Promise.all(
        values.optionFields.map(async (option: any) => {
          if (typeof option.optionImage === "string") {
            return { ...option };
          } else if (option?.optionImage && option?.optionImage[0]) {
            const optionImage = await uploadFile(
              option.optionImage[0],
              "image"
            );
            return { ...option, optionImage };
          }

          return option;
        })
      );
    }

    //  console.log(processedOptionFields);

    // console.log("processed", values?.optionFields);

    // return setLoading(false)

    const newQuestion = question?.questionId
      ? {
          ...values,
          selectedType: optionType,
          questionId: question?.questionId,
          questionImage: image as string,
          optionFields: processedOptionFields,
        }
      : {
          ...values,
          selectedType: optionType,
          questionImage: image as string,
          optionFields: processedOptionFields,
        };

    const payload: Partial<TEngagementFormQuestion> = question?.questionId
      ? {
          ...engagementForm,
          questions: engagementForm?.questions?.map((quest) => {
            if (quest?.questionId === question?.questionId) {
              return { ...newQuestion };
            }
            return quest;
          }),
        }
      : {
          ...engagementForm,
          questions: Array.isArray(engagementForm?.questions)
            ? [...engagementForm.questions, newQuestion]
            : [newQuestion],
        };

    // setLoading(false);
    // return console.log("paylload", payload);
    await postData({ payload });
    setLoading(false);
    refetch();
  }

  const questionImg = form.watch("questionImage");

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

  useEffect(() => {
    if (question) {
      form.reset({
        questionId: question?.questionId,
        questionDescription: question?.questionDescription,
        question: question?.question,
        optionFields: question?.optionFields,
        questionSettings: question?.questionSettings,
        isRequired: question?.isRequired || false,
        showDescription: question?.showDescription || false,
      });
      setOptionType(question?.selectedType);
    }
  }, [question]);

  useEffect(() => {}, [optionType]);

  // console.log("form", form.formState.errors, form.getValues())
  const btnColor = useMemo(() => {
    if (engagementForm?.formSettings?.isPreMade) {
      return engagementForm?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#8841FD";
    } else return engagementForm?.formSettings?.buttonColor || "#001fcc";
  }, [engagementForm]);

  const textColor = useMemo(() => {
    if (engagementForm?.formSettings?.isPreMade) {
      return engagementForm?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#190044";
    } else return engagementForm?.formSettings?.textColor || "#000000";
  }, [engagementForm]);

  const rgba = useMemo(
    (alpha = 0.1) => {
      if (engagementForm) {
        const color = btnColor;
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);

        // Increase brightness (lighter color)
        const lightenFactor = 1.3; // Increase for more brightness
        r = Math.min(255, Math.floor(r * lightenFactor));
        g = Math.min(255, Math.floor(g * lightenFactor));
        b = Math.min(255, Math.floor(b * lightenFactor));

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    },
    [engagementForm, btnColor]
  );
  return (
    <>
      <div className="w-full px-4 sm:px-6 pt-4 sm:pt-6  h-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="w-full flex flex-col  gap-1 items-center">
              <p className="font-medium">Question:</p>
              <p
                style={{
                  borderColor: btnColor || "",
                  backgroundColor: rgba || "",
                  opacity: 50,
                  color: btnColor,
                }}
                className="w-14 h-14 flex text-2xl items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary"
              >
                {questionIndex}
              </p>
            </div>

            <div className="my-6 flex flex-col items-start justify-start gap-3">
              {optionType !== null && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOptionType(null);
                    form.reset({});
                  }}
                  className="flex items-center gap-x-1"
                >
                  <InlineIcon
                    icon="pepicons-print:repeat-circle-filled"
                    fontSize={16}
                    color={btnColor}
                  />
                  <p className="font-medium">Change Option Type</p>
                </button>
              )}
              {optionType === null && (
                <div className="border p-3 gap-4 rounded-lg flex flex-col">
                  <p className="text-center max-w-[60%] self-center">
                    Choose option type for this question
                  </p>

                  <div className="w-full flex flex-wrap  items-center px-4 mx-auto max-w-[90%] gap-6 py-4 sm:py-8 justify-center">
                    {options?.map((item) => (
                      <button
                      style={{
                        
                      }}
                        key={item.type}
                        onClick={() => setOptionType(item?.type)}
                        className={cn(
                          "w-full max-w-[170px] min-w-[170px] bg-white flex border  border-gray-300 items-center gap-x-3 p-2 rounded-lg  sm:p-3"
                        )}
                      >
                        <Image
                          src={item.image}
                          alt="question-type"
                          width={18}
                          height={18}
                          className="object-cover"
                        />
                        <p style={{color: "#000"}}>{item.name}</p>
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
                      btnColor={btnColor}
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
                      btnColor={btnColor}
                    />
                  )}
                  {(optionType === "INPUT_CHECKBOX" ||
                    optionType === "INPUT_MULTIPLE_CHOICE" ||
                    optionType === "DROPDOWN") && (
                    <FormCheckBoxType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      optionType={optionType}
                      setOption={(value: string) => {
                        setOptionType(value);
                      }}
                      btnColor={btnColor}
                      rgba={rgba || "#001FCC19"}
                    />
                  )}

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
                      btnColor={btnColor}
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
                      btnColor={btnColor}
                    />
                  )}
                  {optionType === "PICTURE_CHOICE" && (
                    <FormImageUploadType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      btnColor={btnColor}
                    />
                  )}

                  {optionType === "INPUT_ADDRESS" && (
                    <FormAddressType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      btnColor={btnColor}
                    />
                  )}

                  {optionType === "CONTACT" && (
                    <FormContactType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      btnColor={btnColor}
                    />
                  )}

                  {optionType === "YES_OR_NO" && (
                    <FormYesNoType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      btnColor={btnColor}
                    />
                  )}

                  {(optionType === "INPUT_EMAIL" ||
                    optionType === "PHONE_NUMBER" ||
                    optionType === "COUNTRY" ||
                    optionType === "WEBSITE") && (
                    <FormBasicType
                      form={form}
                      engagementForm={engagementForm}
                      defaultQuestionValue={defaultQuestionValue}
                      question={question}
                      refetch={async () => {
                        refetch();
                        editQuestion(null);
                      }}
                      btnColor={btnColor}
                      type={
                        optionType === "INPUT_EMAIL"
                          ? "Email"
                          : optionType === "WEBSITE"
                          ? "Website"
                          : optionType === "COUNTRY"
                          ? "Country"
                          : "Phone Number"
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {optionType !== null && (
              <div className="w-full my-10 flex gap-3 items-center justify-center">
                <Button
                  style={{
                    backgroundColor: btnColor,
                  }}
                  disabled={loading}
                  className={cn(
                    "h-11 rounded-lg gap-x-2 text-white font-medium",
                    !btnColor && "bg-basePrimary"
                  )}
                >
                  {loading && <LoaderAlt size={20} className="animate-spin" />}
                  <p>Save Question</p>
                </Button>
              </div>
            )}
            <p className="w-1 h-1"></p>
          </div>
        </form>
      </div>
    </>
  );
}
