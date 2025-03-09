"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { COUNTRY_CODE } from "@/utils/countryCode";

export function CountryTypeAnswer({
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
  const questionId = form.watch(`questions.${index}.questionId`);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );

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
        <p className="  w-full text-sm">
          {" "}
          {response?.selectedOption || "Select a Country"}
        </p>

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
                {COUNTRY_CODE.map((value, id) => {
                  const isSelected = response?.selectedOption === value?.name;

                  return (
                    <>
                      <div
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          form.setValue(`responses.${index}.response`, {
                            optionId: value?.code,
                            selectedOption: value?.name,
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
                        style={{
                          backgroundColor: isSelected ? rgba : "",
                        }}
                        className={cn(
                          "w-full h-12 border-b bg-white rounded-none  px-4 py-6 relative"
                        )}
                      >
                        <div className="w-full h-full">
                          <div className="w-full h-full flex items-center justify-start gap-x-3">
                            <div className="  w-full text-sm">
                              {value?.name}
                            </div>
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
