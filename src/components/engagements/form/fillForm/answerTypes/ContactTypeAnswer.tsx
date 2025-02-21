"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Input } from "@/components/ui/input";
import { ContactType } from "../../addFormQuestions/_components";
import { useEffect, useState } from "react";
import { formatText } from "@/utils";

type TContactTypeAnswer = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  company: string;
};

export function ContactTypeAnswer({
  form,
  index,
  rgba,
  bgColor,
  selectedType,
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  bgColor: string;
  rgba: string;
  selectedType: string;
}) {
  const question = form.watch(`questions.${index}.question`);
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const showDescription = form.watch(`questions.${index}.showDescription`);
  const settings = form.watch(
    `questions.${index}.questionSettings`
  ) as ContactType;
  const questionId = form.watch(`questions.${index}.questionId`);
  const [answers, setAnswers] = useState<TContactTypeAnswer>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    company: "",
  });
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );

  const order = ["firstName", "lastName", "phoneNumber", "email", "company"];

  useEffect(() => {
    if (answers) {
      form.setValue(`responses.${index}.response`, answers);
      form.setValue(`responses.${index}.type`, selectedType!);
      form.setValue(`responses.${index}.questionId`, questionId);
    }
  }, [answers]);
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

      <div className="flex flex-col items-start gap-y-3 justify-start w-full">
        {order.map((key) => (
          <div
            key={key}
            className="w-full flex flex-col items-start justify-start gap-y-2"
          >
            <label>{formatText(key)}</label>
            <Input
              name={key}
              value={answers[key as keyof TContactTypeAnswer]}
              onChange={(e) => {
                setAnswers({
                  ...answers,
                  [key as keyof TContactTypeAnswer]: e.target.value,
                });
              }}
              type={
                key === "email"
                  ? "email"
                  : key === "phoneNumber"
                  ? "tel"
                  : "text"
              }
              required={settings[key as keyof TContactTypeAnswer]}
              className="w-full h-11 sm:h-12 rounded-md border-x-0 border-b border-t-0 bg-transparent  px-2 placeholder:text-gray-500 placeholder-gray-500"
              placeholder="Enter Answer"
            />
          </div>
        ))}
      </div>
    </>
  );
}
