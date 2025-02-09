"use client";

import { formAnswerSchema } from "@/schemas";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FillFormQuestion } from "../common";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

const fileTypes: { [key: string]: string[] } = {
    Image: ["image/*"],
    Video: ["video/*"],
    Pdf: ["application/pdf"],
    Docx: [
      ".doc",
      ".docx",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    Excel: [
      ".xls",
      ".xlsx",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ],
    PPT: [
      ".ppt",
      ".pptx",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ],
    All: ["*"]
  };

export function UploadTypeAnswer({
  form,
  index,
  rgba,
  bgColor
}: {
  form: UseFormReturn<z.infer<typeof formAnswerSchema>, any, any>;
  index: number;
  bgColor:string;
  rgba:string;
}) {
 const question = form.watch(`questions.${index}.question`);
  const optionFields = form.watch(`questions.${index}.optionFields`)
  const isRequired = form.watch(`questions.${index}.isRequired`);
  const questionImage = form.watch(`questions.${index}.questionImage`);
  const selectedType = form.watch(`questions.${index}.selectedType`);
  const questionId = form.watch(`questions.${index}.questionId`);
  const questionDescription = form.watch(
    `questions.${index}.questionDescription`
  );

  const generateAcceptString: string = useMemo(() => {
   if (optionFields && typeof optionFields !== "string") {
 const acceptedTypes =  optionFields.flatMap((type: string) => fileTypes[type] || []);
    return acceptedTypes.join(",") || "*"
   }
   else {
    return "*"
   }
  },[optionFields])
  return (
    <>
      <FillFormQuestion
        currentIndex={index + 1}
        questionImage={questionImage}
        currentQuestion={question}
        description={questionDescription}
        isRequired={isRequired}
      />

      <div className="w-full">
        <Input
         style={{
            backgroundColor: rgba
        }}
           name={`responses.${index}.response`}
          
              onChange={(e) => {
               if (e.target.files) {
                  const files = e.target.files[0]
                  form.setValue(`responses.${index}.response`, files);
                  form.setValue(`responses.${index}.type`, selectedType!);
                  form.setValue(`responses.${index}.questionId`, questionId);
               }
              }}
          required={isRequired}
          type="file"
          accept={generateAcceptString}
          className="w-full h-11 sm:h-12 rounded-md px-2 placeholder:text-gray-500 placeholder-gray-500"
          placeholder="Enter Answer"
        />
      </div>
    </>
  );
}
