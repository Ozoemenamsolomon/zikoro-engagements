import { TextEditor } from "@/components/custom";
import { ActionModal } from "@/components/custom/ActionModal";
import { Switch } from "@/components/ui/switch";
import { AddQuizImageIcon } from "@/constants";
import { usePostRequest } from "@/hooks/services/requests";
import { formQuestion } from "@/schemas";
import { TEngagementFormQuestion } from "@/types/form";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useState } from "react";
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
}: {
  defaultQuestionValue: string;
  question: TEngagementFormQuestion["questions"][number] | null;
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  addedImage: string | null;
  engagementForm: TEngagementFormQuestion;
  refetch: () => Promise<any>;
  type: string;
}) {
  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const [isLoading, setIsLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
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
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <p className="text-mobile">Required</p>
            <Switch
              checked={isRequired}
              onCheckedChange={(checked) => {
                form.setValue("isRequired", checked);
              }}
              className=""
            />
          </div>
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
              <p className="text-mobile">Delete</p>
              <InlineIcon icon="icon-park-twotone:delete" fontSize={22} />
            </button>
          )}
        </div>
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
