"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { cn } from "@/lib/utils";

export function YesNoTypeAnswer({
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
  const questionId = form.watch(`questions.${index}.questionId`);
  const showDescription = form.watch(`questions.${index}.showDescription`);

  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );

  const response =
    useWatch({
      control: form.control,
      name: `responses.${index}.response` as const,
    }) || "";

  console.log(response);

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
        <label
          // htmlFor={`checkbox-${index}`}
          style={{
            backgroundColor:
              response === "Yes" ? bgColor : rgba,
          }}
          className={cn(
            "w-full h-fit rounded-lg   p-2 relative",
            response === "Yes" && " text-white"
          )}
        >
          <input
            type="radio"
            // id={`checkbox-${index}`}
            onChange={(e) => {
              e.target.checked
                ? form.setValue(`responses.${index}.response`, e.target.value)
                : form.setValue(`responses.${index}.response`, "");

              form.setValue(`responses.${index}.type`, selectedType!);
              form.setValue(`responses.${index}.questionId`, questionId);
            }}
            checked={response === "Yes"}
            value={"Yes"}
            required={isRequired}
            className="absolute invisible inset-0 w-full h-full z-10"
          />
          <div className="w-full flex justify-start gap-x-2 items-center">
            <p
              style={{
                color: response === "Yes" ? bgColor : "",
                borderColor: response === "Yes" ? bgColor : "",
              }}
              className={cn(
                "font-bold rounded-lg bg-white text-2xl h-11 w-11 flex items-center justify-center border border-black"
              )}
            >
              Y
            </p>
            <p className="text-sm">Yes</p>
          </div>
        </label>

        <label
          // htmlFor={`checkbox-${index}`}
          style={{
            backgroundColor: response === "No" ? bgColor : rgba,
          }}
          className={cn(
            "w-full h-fit rounded-lg  p-2 relative",
            response === "No" && " text-white"
          )}
        >
          <input
            type="radio"
            // id={`checkbox-${index}`}
            onChange={(e) => {
              e.target.checked
                ? form.setValue(`responses.${index}.response`, e.target.value)
                : form.setValue(`responses.${index}.response`, "");

              form.setValue(`responses.${index}.type`, selectedType!);
              form.setValue(`responses.${index}.questionId`, questionId);
            }}
            checked={response === "No"}
            value={"No"}
            required={isRequired}
            className="absolute invisible inset-0 w-full h-full z-10"
          />
          <div className="w-full flex justify-start gap-x-2 items-center">
            <p
              style={{
                color: response === "No" ? bgColor : "",
                borderColor: response === "No" ? bgColor : "",
              }}
              className={cn(
                "font-bold rounded-lg bg-white text-2xl h-11 w-11 flex items-center justify-center border border-black"
              )}
            >
              N
            </p>
            <p className="text-sm">No</p>
          </div>
        </label>
      </div>
    </>
  );
}
