"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Input } from "@/components/ui/input";

enum TextType {
  email = "Email",
  website = "Website",
  phone = "Phone Number",
  text = "Answer",
}

export function TextTypeAnswer({
  form,
  index,
  rgba,
  btnColor,
  selectedType,
  hideNumber,
  hideLabel
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  btnColor: string;
  rgba: string;
  selectedType: string;
  hideNumber:boolean;
  hideLabel:boolean
}) {
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const settings = form.watch(`questions.${index}.questionSettings`);
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
        showDescription={showDescription}
        btnColor={btnColor}
        rgba={rgba}
        hideNumber={hideNumber}
      />

      <div className="flex flex-col items-start gap-y-2 justify-start w-full">
        <label>
          {selectedType === "INPUT_EMAIL"
            ? TextType.email
            : selectedType === "PHONE_NUMBER"
            ? TextType.phone
            : selectedType === "INPUT_TEXT"
            ? "Answer"
            : TextType.website}
        </label>
        <Input
          name={`responses.${index}.response`}
          value={form.getValues(`responses.${index}.response`)}
          onChange={(e) => {
            form.setValue(`responses.${index}.response`, e.target.value);
            form.setValue(`responses.${index}.type`, selectedType!);
            form.setValue(`responses.${index}.questionId`, questionId);
          }}
          type={
            selectedType === "INPUT_EMAIL"
              ? "email"
              : selectedType === "PHONE_NUMBER"
              ? "tel"
              : "text"
          }
          maxLength={selectedType === "INPUT_TEXT" ? settings : null}
          required={isRequired}
          className="w-full h-11 sm:h-12 rounded-none border-x-0 border-t-0 border-b bg-transparent px-2 placeholder:text-gray-500 placeholder-gray-500"
          placeholder="Enter Answer"
        />
      </div>
    </>
  );
}
