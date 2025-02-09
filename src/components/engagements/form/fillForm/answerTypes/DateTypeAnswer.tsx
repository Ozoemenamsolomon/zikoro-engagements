"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DateRange } from "styled-icons/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formateJSDate } from "@/utils";

type OptionType = {
  start: Date;
  end: Date;
};
export function DateTypeAnswer({
  form,
  index,
  bgColor,
  rgba
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  bgColor:string;
  rgba:string;
}) {
  const [isDatePanel, setDatePanel] = useState(false);
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const optionFields = form.watch(`questions.${index}.optionFields`) as
    | OptionType
    | undefined;
  const questionId = form.watch(`questions.${index}.questionId`);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  return (
    <>
      <FillFormQuestion
        currentIndex={index + 1}
        questionImage={questionImage}
        currentQuestion={question}
        description={questionDescription}
        isRequired={isRequired}
      />

      <div className="w-full h-11 sm:h-12 relative">
        <Input
        style={{
            backgroundColor: rgba
        }}
          name={`responses.${index}.response`}
          value={form.getValues(`responses.${index}.response`)}
          required={isRequired}
          className="w-full h-11 sm:h-12 rounded-md  pl-8 pr-2 placeholder:text-gray-500 placeholder-gray-500"
          placeholder="YYYY MM DD"
        />
        <button
          onClick={() => setDatePanel((prev) => !prev)}
          className="absolute h-full inset-y-0 left-2"
        >
          <DateRange size={20} />
          {isDatePanel && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="absolute top-8 right-[-95px] md:right-0"
            >
              <button
                onClick={() => setDatePanel((prev) => !prev)}
                className="w-full h-full fixed inset-0 z-[150] "
              ></button>
              <div
                role="button"
                onClick={(e) => e.stopPropagation()}
                className="relative z-[300]"
              >
                <DatePicker
                  selected={optionFields?.start}
                  minDate={optionFields?.start}
                  maxDate={optionFields?.end}
                  onChange={(date) => {
                    form.setValue(
                      `responses.${index}.response`,
                      formateJSDate(date ?? new Date())
                    );
                    form.setValue(`responses.${index}.type`, selectedType!);
                    form.setValue(`responses.${index}.questionId`, questionId);
                  }}
                  inline
                />
              </div>
            </div>
          )}
        </button>
      </div>
    </>
  );
}
