"use client";

import { formQuestion } from "@/schemas";
import { useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";

export function FormUploadType({
  form,
  defaultQuestionValue,
  question,
  engagementForm,
  refetch,
}: {
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  question: TEngagementFormQuestion["questions"][number] | null;
  engagementForm: TEngagementFormQuestion;
  defaultQuestionValue: string;
  refetch: () => Promise<any>;
}) {
  const addedImage = form.watch("questionImage");
  const addedDescription = form.watch("questionDescription");

  const selectedOptions =
    useWatch({
      control: form.control,
      name: `optionFields` as const,
    }) || [];
  const image = useMemo(() => {
    if (typeof addedImage === "string") {
      return addedImage;
    } else if (addedImage && addedImage[0] && addedImage instanceof FileList) {
      return URL.createObjectURL(addedImage[0]);
    } else {
      return null;
    }
  }, [addedImage]);

  const defaultDescriptionValue = useMemo(() => {
    if (typeof addedDescription === "string" && addedDescription?.length > 0) {
      return addedDescription;
    } else {
      return "";
    }
  }, [addedDescription]);

  return (
    <>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <FormQuestionField
          defaultQuestionValue={defaultQuestionValue}
          addedImage={image}
          form={form}
          engagementForm={engagementForm}
          question={question}
          refetch={refetch}
          type="Upload"
        />

        <FormQuestionDescription
          defaultDescriptionValue={defaultDescriptionValue}
          form={form}
        />

        <div className="w-full ">
          <p className="font-medium my-3">File Type</p>
          <div className="flex flex-wrap items-center justify-start gap-6 w-full">
            {["Image", "Video", "Pdf", "Docx", "Excel", "PPT", "All"].map(
              (value) => (
                <label className="flex items-center gap-x-1">
                  <input
                    onChange={(e) => {
                      const updatedValue = e.target.checked
                        ? [...(selectedOptions || []), value]
                        : selectedOptions?.filter(
                            (v: any) => v?.selectedOption !== value
                          );
                      form.setValue(`optionFields`, updatedValue);
                    }}
                    value={value}
                    type="checkbox"
                    checked={selectedOptions.some(
                      (v: any) => v?.option === value
                    )}
                    className="h-[20px] pt-3 w-[20px] rounded-full mr-2 accent-basePrimary"
                  />
                  <span className="capitalize">{value}</span>
                </label>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
