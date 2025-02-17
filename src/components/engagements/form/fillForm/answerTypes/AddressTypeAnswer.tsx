"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Input } from "@/components/ui/input";
import { AddressType } from "../../addFormQuestions/_components";
import { useEffect, useState } from "react";
import { formatText } from "@/utils";

type TAddressTypeAnswer = {
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

export function AddressTypeAnswer({
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
  const settings = form.watch(
    `questions.${index}.questionSettings`
  ) as AddressType;
  const questionId = form.watch(`questions.${index}.questionId`);
  const [answers, setAnswers] = useState<TAddressTypeAnswer>({
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );
  const order = [
    "address_1",
    "address_2",
    "city",
    "state",
    "zip_code",
    "country",
  ];

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
      />

      <div className="flex flex-col items-start gap-y-3 justify-start w-full">
        {order.map((key) => (
          <div 
          key={key}
          className="w-full flex flex-col items-start justify-start gap-y-2">
            <label>{formatText(key)}</label>
            <Input
              style={{
                backgroundColor: rgba,
              }}
              name={key}
              value={answers[key as keyof TAddressTypeAnswer]}
              onChange={(e) => {
                setAnswers({
                  ...answers,
                  [key as keyof TAddressTypeAnswer]: e.target.value,
                });
              }}
              type={key === "zip_code" ? "number" : "text"}
              required={settings[key as keyof TAddressTypeAnswer]}
              className="w-full h-11 sm:h-12 rounded-md  px-2 placeholder:text-gray-500 placeholder-gray-500"
              placeholder="Enter Answer"
            />
          </div>
        ))}
      </div>
    </>
  );
}
