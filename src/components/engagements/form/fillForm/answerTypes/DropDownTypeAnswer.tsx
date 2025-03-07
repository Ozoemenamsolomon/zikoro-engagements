"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { shuffleArray } from "@/utils";

type OptionItemsType = {
  id: string;
  option: string;
  optionImage: string;
};

export function DropDownTypeAnswer({
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
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const [isOpen, setOpen] = useState(false);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const settings = form.watch(`questions.${index}.questionSettings`);
  const questionId = form.watch(`questions.${index}.questionId`);
  const [options, setOptions] = useState<OptionItemsType[]>([]);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  const optionFields = form.watch(
    `questions.${index}.optionFields`
  ) as OptionItemsType[];
  const response =
    useWatch({
      control: form.control,
      name: `responses.${index}.response` as const,
    }) || "";

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

      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        // style={{
        //   backgroundColor: rgba,
        // }}
        className="w-full relative border h-12 px-3 flex items-center justify-start rounded-lg"
      >
        <p
          className="innerhtml  w-full text-sm"
          dangerouslySetInnerHTML={{
            __html: response?.selectedOption || "Select an Answer",
          }}
        />

        {isOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="top-12 absolute inset-x-0"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpen(false);
              }}
              className="w-full h-full inset-0 fixed z-[100]"
            ></div>

            <div className="w-full overflow-y-auto vert-scroll relative z-[300] bg-white rounded-lg shadow h-fit max-h-[300px]">
              <div className="w-full flex flex-col items-start justify-start">
                {Array.isArray(options) &&
                  options.map((value, id) => {
                    const isSelected =
                      response?.selectedOption === value?.option;
                  //  console.log(isSelected, value?.option);
                    return (
                      <>
                        <div
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            form.setValue(`responses.${index}.response`, {
                              optionId: value?.id,
                              selectedOption: value?.option,
                            });

                            form.setValue(
                              `responses.${index}.type`,
                              selectedType!
                            );
                            form.setValue(
                              `responses.${index}.questionId`,
                              questionId
                            );
                            setOpen(false);
                          }}
                          key={id}
                          // htmlFor={`checkbox-${index}`}
                          style={{
                            backgroundColor: isSelected ? rgba : "",
                          }}
                          className={cn(
                            "w-full h-12 border-b bg-white rounded-none  px-4 py-6 relative"
                          )}
                        >
                          <div className="w-full h-full">
                            <div className="w-full h-full flex items-center justify-start gap-x-3">
                              {/* <span
                                style={{
                                  color: isSelected ? bgColor : "",
                                }}
                                className={cn(
                                  "rounded-lg h-8 flex items-center text-gray-600 justify-center font-medium w-8 bg-white border border-gray-700"
                                )}
                              >
                                {index + 1}
                              </span> */}
                              <div
                                className="innerhtml  w-full text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: value?.option ?? "",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
