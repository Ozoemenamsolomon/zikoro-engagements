"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { shuffleArray } from "@/utils";

type OptionItemsType = {
  id: string;
  option: string;
  optionImage: string;
};

export function MultiChoiceTypeAnswer({
  form,
  index,
  rgba,
  bgColor,
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  rgba: string;
  bgColor: string;
}) {
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const settings = form.watch(`questions.${index}.questionSettings`);
  const questionId = form.watch(`questions.${index}.questionId`);
  const [options, setOptions] = useState<OptionItemsType[]>([]);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  const optionFields = form.watch(
    `questions.${index}.optionFields`
  ) as OptionItemsType[];
  const responseOption =
    useWatch({
      control: form.control,
      name: `responses.${index}.response` as const,
    }) || [];

  useEffect(() => {
    if (settings) {
      const inOrder = settings?.inOrder;
      if (!inOrder) {
        const randomizedArray = shuffleArray(optionFields);
        setOptions(randomizedArray);
      } else {
        setOptions(optionFields);
      }
    }
  }, [settings]);
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

      <div className="w-full flex flex-col items-start justify-start gap-y-4">
        {Array.isArray(options) &&
          options.map((value, id) => {
            const isSelected = responseOption.some(
              (v: any) =>
                v?.selectedOption === (value?.option || value?.optionImage)
            );
            return (
              <>
                <label
                  key={id}
                  style={{
                    backgroundColor: isSelected ? bgColor : '',
                  }}
                  className={cn(
                    "w-full h-fit rounded-lg  px-4 py-6 border relative",
                    isSelected && " text-white"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={responseOption.some(
                      (v: any) =>
                        v?.selectedOption ===
                        (value?.option || value?.optionImage)
                    )}
                    onChange={(e) => {
                      // const field = form.getValues(`responses.${index}.response`)
                      // console.log(field)
                      const updatedValue = e.target.checked
                        ? [
                            ...(responseOption || []),
                            {
                              optionId: value?.id,
                              selectedOption:
                                value?.option || value?.optionImage,
                            },
                          ]
                        : responseOption?.filter(
                            (v: any) =>
                              v?.selectedOption !==
                              (value?.option || value?.optionImage)
                          );
                      form.setValue(
                        `responses.${index}.response`,
                        updatedValue
                      );
                      form.setValue(`responses.${index}.type`, selectedType!);
                      form.setValue(
                        `responses.${index}.questionId`,
                        questionId
                      );
                    }}
                    value={value?.option || value?.optionImage}
                    required={isRequired}
                    className="absolute invisible inset-0 w-full h-full z-10"
                  />
                  <div className="w-full grid grid-cols-1 sm:grid-cols-5 items-center">
                    <div className="w-full flex items-center gap-x-3 col-span-full sm:col-span-3">
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
                      <div
                        className="innerhtml  w-full text-sm"
                        dangerouslySetInnerHTML={{
                          __html: value?.option ?? "",
                        }}
                      />
                    </div>

                    {value?.optionImage && (
                      <div className="w-[200px] sm:w-full sm:col-span-2">
                        <Image
                          src={value?.optionImage}
                          alt=""
                          className="w-full h-[10rem] rounded-lg object-cover"
                          width={1000}
                          height={600}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </>
            );
          })}
      </div>
    </>
  );
}
