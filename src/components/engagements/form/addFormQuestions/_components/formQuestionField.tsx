import { TextEditor } from "@/components/custom";
import { ActionModal } from "@/components/custom/ActionModal";
import { Switch } from "@/components/ui/switch";
import { AddQuizImageIcon } from "@/constants";
import { usePostRequest } from "@/hooks/services/requests";
import { cn } from "@/lib/utils";
import { formQuestion } from "@/schemas";
import { TEngagementFormQuestion } from "@/types/form";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React, { ReactNode, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";

export function FormQuestionField({
  defaultQuestionValue,
  question,
  addedImage,
  form,
  engagementForm,
  refetch,
  type,
  SettingWidget,
  isNotOverflow,
  isText,
  isTemplateType,
  togggleRequired
}: {
  defaultQuestionValue: string;
  question: TEngagementFormQuestion["questions"][number] | null;
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  addedImage: string | null;
  engagementForm: TEngagementFormQuestion;
  refetch: () => Promise<any>;
  type: string;
  isNotOverflow?: boolean;
  SettingWidget?: ReactNode;
  isText?:boolean;
  isTemplateType?:boolean;
  togggleRequired?:(t:boolean) => void;
}) {
  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");

  const [isLoading, setIsLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isSettings, setShowSettings] = useState(false);
  function onChange(v: string) {
    form.setValue("question", v);
  }
  const {
    formState: { errors },
  } = form;

  const isRequired = useWatch({
    control: form.control,
    name: `isRequired` as const,
  });

  async function deleteQuestion() {
    if (!question) return;
    setIsLoading(true);
    const filteredQuestion = engagementForm?.questions?.filter(
      (q) => q.questionId !== question.questionId
    );
    const payload: Partial<TEngagementFormQuestion> = {
      ...engagementForm,
      questions: filteredQuestion,
    };

    await postData({ payload });
    setIsLoading(false);
    refetch();
  }

  function showDeletModal() {
    setIsDelete((prev) => !prev);
  }
  // engagementQuestionValue , question
  return (
    <div className="w-full ">
      <div className="w-full flex items-center justify-between">
        <p>Question ({type})</p>

        {question !== null && (
          <button
            className="flex items-center gap-x-1"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              showDeletModal();
            }}
          >
            <InlineIcon icon="icon-park-twotone:delete" fontSize={22} />
          </button>
        )}
      </div>
      <div className="w-full mt-3  flex items-center gap-x-3">
        {
          <div className="w-full">
            <TextEditor
              defaultValue={defaultQuestionValue}
              placeholder="Enter your Question"
              onChange={onChange}
              error={errors?.question ? errors?.question?.message : ""}
            />
          </div>
        }
        <div className="flex flex-col items-start justify-start gap-2">
          <label htmlFor="form-question-img">
            <input
              hidden
              id="form-question-img"
              type="file"
              accept="image/*"
              {...form.register("questionImage")}
            />
            <AddQuizImageIcon />
          </label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowSettings(true);
            }}
            className="relative"
            title="setting"
          >
            <InlineIcon icon="duo-icons:settings" fontSize={22} />
            {isSettings && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="absolute right-[4px] top-5"

              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowSettings(false);
                  }}
                  className="w-full h-full inset-0 fixed z-[100]"
                ></div>
                <div
                  className={cn(
                    "w-[280px] relative z-[200] max-h-[250px] overflow-y-auto vert-scroll bg-white shadow rounded-lg py-4 h-fit",
                    isNotOverflow && "max-h-fit  overflow-y-visible",
                    isText && "w-[250px]"
                  )}
                >
                  <div className="flex w-full px-3 mb-4 items-center justify-between">
                  <p className="text-mobile">{isTemplateType ? "Required All" :"Required"}</p>
                    <Switch
                      checked={isRequired}
                      onClick={(e) => {
                 
                        e.preventDefault();
                        form.setValue("isRequired", !isRequired);
                        togggleRequired?.(!isRequired)
                      }}
                  
                      className=""
                    />
                  
                  </div>
                  {SettingWidget}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
      {addedImage && (
        <div className="w-full flex mt-3 items-center justify-center">
          <Image
            src={addedImage}
            alt=""
            className="w-[250px] h-[250px] object-cover rounded-lg"
            width={400}
            height={400}
          />
        </div>
      )}

      {isDelete && (
        <ActionModal
          close={showDeletModal}
          asynAction={deleteQuestion}
          buttonText="Delete"
          title="Question"
          modalTitle="Delete Question"
          titleColor="text-red-500"
          buttonColor="bg-red-500 text-white"
          loading={isLoading}
        />
      )}
    </div>
  );
}
