import { TextEditor } from "@/components/custom";
import { AddQuizImageIcon } from "@/constants";
import { quizQuestionSchema } from "@/schemas/quiz";
import { TQuestion } from "@/types/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

export function QuestionField({
  defaultQuestionValue,
  question,
  addedImage,
  form,
}: {
  defaultQuestionValue: string;
  question: TQuestion | null;
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
  addedImage: string | null;
}) {
  function onChange(v: string) {
    form.setValue("question", v);
  }
  return (
    <div className="w-full ">
      <div className="w-full flex items-center justify-between">
        <p>Question</p>
        <InlineIcon icon="icon-park-twotone:delete" fontSize={22} />
      </div>
      <div className="w-full mt-3  flex items-center gap-x-3">
        {(defaultQuestionValue || !question) && (
          <div className="w-full">
            <TextEditor
              defaultValue={defaultQuestionValue}
              placeholder="Enter your Question"
              onChange={onChange}
            />
          </div>
        )}
        <label htmlFor="quiz-img">
          <input
            hidden
            id="quiz-img"
            type="file"
            accept="image/*"
            {...form.register("questionImage")}
          />
          <AddQuizImageIcon />
        </label>
      </div>
      {addedImage && (
        <div className="w-full flex items-center justify-center">
          <Image
            src={addedImage}
            alt=""
            className="w-[250px] h-[250px] object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
