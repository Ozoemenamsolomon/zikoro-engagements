"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import Image from "next/image";
import { cn } from "@/lib/utils";

type UploadOptionItemsType = {
  id: string;
  image: string;
};

export function ImageUploadTypeAnswer({
  form,
  index,
  bgColor,
  rgba,
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  bgColor: string;
  rgba: string;
}) {
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const questionId = form.watch(`questions.${index}.questionId`);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  const optionFields = form.watch(
    `questions.${index}.optionFields`
  ) as UploadOptionItemsType[];
  const response =
    useWatch({
      control: form.control,
      name: `responses.${index}.response` as const,
    }) || "";
  return (
    <>
      <FillFormQuestion
        currentIndex={index + 1}
        questionImage={questionImage}
        currentQuestion={question}
        description={questionDescription}
        isRequired={isRequired}
        showDescription={showDescription}
      />

      <div className="w-full flex flex-wrap items-center justify-center gap-4">
        {Array.isArray(optionFields) &&
          optionFields.map((value) => {
            const isSelected = response?.selectedOption === value?.image;
            return (
              <>
                <label
                  // htmlFor={`image-upload-${index}`}
                  style={{
                    backgroundColor: isSelected ? bgColor : "",
                  }}
                  className={cn(
                    "w-28 h-fit rounded-lg flex-col border-x-0 border-b border-t-0 bg-transparent flex gap-3 items-center justify-center px-4 py-6 relative",
                    isSelected && " text-white"
                  )}
                >
                  <input
                    type="radio"
                    // id={`image-upload-${index}`}
                    onChange={(e) => {
                      e.target.checked
                        ? form.setValue(`responses.${index}.response`, {
                            optionId: value?.id,
                            selectedOption: e.target.value,
                          })
                        : form.setValue(`responses.${index}.response`, "");

                      form.setValue(`responses.${index}.type`, selectedType!);
                      form.setValue(
                        `responses.${index}.questionId`,
                        questionId
                      );
                      console.log(form.watch(`responses.${index}.response`));
                      console.log(form.watch("responses"));
                    }}
                    checked={response?.selectedOption === value?.image}
                    value={value?.image}
                    required={isRequired}
                    className="absolute invisible inset-0 w-full h-full z-10"
                  />
                  <span
                    style={{
                      color: isSelected ? bgColor : "",
                    }}
                    className={cn(
                      "rounded-lg h-8 flex items-center text-gray-600 justify-center font-medium w-8 bg-white border border-gray-700"
                    )}
                  >
                    {index + 1}
                  </span>

                  <Image
                    src={value?.image}
                    alt=""
                    width={400}
                    height={400}
                    className="w-28 rounded-lg object-cover h-32"
                  />
                </label>
              </>
            );
          })}
      </div>
    </>
  );
}
