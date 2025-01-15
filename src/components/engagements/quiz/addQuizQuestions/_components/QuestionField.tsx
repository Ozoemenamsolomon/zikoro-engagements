import { TextEditor } from "@/components/custom";
import { AddQuizImageIcon } from "@/constants";
import { usePostRequest } from "@/hooks/services/requests";
import { quizQuestionSchema } from "@/schemas/quiz";
import { TQuestion, TQuiz } from "@/types/quiz";
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
  quiz,
  refetch
}: {
  defaultQuestionValue: string;
  question: TQuestion | null;
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
  addedImage: string | null;
  quiz: TQuiz<TQuestion[]>;
  refetch:() => Promise<any>
}) {
  const {postData} = usePostRequest<Partial<TQuiz<TQuestion[]>>>('engagements/quiz')
  const [isLoading, setIsLoading] = useState(false)
  function onChange(v: string) {
    form.setValue("question", v);
  }
  const {formState:{errors}} = form;

  async function deleteQuestion() {
    if (!question) return;
    setIsLoading(true)
    const filteredQuestion = quiz?.questions?.filter((q) => q.id !== question.id)
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      questions: filteredQuestion


    }

    await postData({payload})
    refetch()

  }
  return (
    <div className="w-full ">
      <div className="w-full flex items-center justify-between">
        <p>Question</p>
      {question !== null && <button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        deleteQuestion()
      }}
      >
       <InlineIcon icon="icon-park-twotone:delete" fontSize={22} />
       </button>}
      </div>
      <div className="w-full mt-3  flex items-center gap-x-3">
        {(defaultQuestionValue || !question) && (
          <div className="w-full">
            <TextEditor
              defaultValue={defaultQuestionValue}
              placeholder="Enter your Question"
              onChange={onChange}
              error={errors?.question ? errors?.question?.message : ""}
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
            width={400}
            height={400}
          />
        </div>
      )}
    </div>
  );
}
