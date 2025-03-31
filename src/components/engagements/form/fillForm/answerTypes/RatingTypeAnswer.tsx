"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Star } from "styled-icons/fluentui-system-regular";
import { StarFullOutline } from "styled-icons/typicons";

export function RatingTypeAnswer({
  form,
  index,
  btnColor,
  rgba,
  hideNumber,
  hideLabel
  
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  btnColor: string;
  rgba: string;
  hideNumber:boolean
  hideLabel:boolean;

}) {
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const optionFields = form.watch(`questions.${index}.optionFields`);
  const questionId = form.watch(`questions.${index}.questionId`);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  const rating = form.watch(`responses.${index}.response`) || "";

  function setRating(n: number) {
    form.setValue(`responses.${index}.response`, n);
    form.setValue(`responses.${index}.type`, selectedType!);
    form.setValue(`responses.${index}.questionId`, questionId);
  }
  return (
    <>
      <FillFormQuestion
        currentIndex={index + 1}
        questionImage={questionImage}
        currentQuestion={question}
        description={questionDescription}
        isRequired={isRequired}
        btnColor={btnColor}
        rgba={rgba}
        showDescription={showDescription}
        hideNumber={hideNumber}
      />

      <div className="w-full flex flex-wrap items-center gap-x-2 justify-center">
        {Array.from({ length: optionFields as number })?.map((v, index) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setRating(index + 1);
            }}
            key={index}
            style={{
              color: index + 1 <= rating ? btnColor : btnColor,
            }}
           
          >
            {index + 1 <= rating ? (
              <StarFullOutline size={24} />
            ) : (
              <Star size={24} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
