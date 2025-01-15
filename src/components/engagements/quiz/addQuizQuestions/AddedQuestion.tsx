import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import { TQuestion } from "@/types/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

export function AddedQuestions({
  className,
  questions,
  editingQuestion,
  editQuestion,
  addNewQuestion,
}: {
  questions: TQuestion[];
  className?: string;
  editingQuestion: TQuestion | null;
  editQuestion: (t: TQuestion) => void;
  addNewQuestion: () => void;
}) {
  const [isNew, setIsNew] = useState(true)
  return (
    <div
      className={cn(
        "w-full bg-white h-full mt-8 border rounded-lg col-span-3 py-6 px-3",
        className
      )}
    >
      <div className="w-full mb-6 flex items-center justify-between">
        <p className="">
          No. Questions:{" "}
          <span className="font-semibold text-basePrimary">
            {questions?.length}
          </span>
        </p>

        <Button className="w-fit h-fit px-0 gap-x-1" onClick={()=> {
          addNewQuestion()
          setIsNew(true)
        }}>
          <InlineIcon
            icon="icon-park-twotone:add-one"
            fontSize={18}
            color="#001fcc"
          />
          <p className="font-medium text-basePrimary">Add Question</p>
        </Button>
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        {Array.isArray(questions) &&
          questions?.map((quest, index) => (
            <div
              className="w-full"
              onClick={() => {
                editQuestion(quest)
                setIsNew(false)
              }}
              key={quest?.id}
            >
              <SingleQuestionCard
                index={index}
                question={quest}
                isEditing={
                  editingQuestion !== null && editingQuestion?.id === quest?.id
                }
              />
            </div>
          ))}
        <div
          className={cn(
            "w-full rounded-lg  border  h-36 hidden items-center justify-center",
            editingQuestion === null && "border-basePrimary",
            isNew && 'flex'
          )}
        >
          <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
            {Array.isArray(questions) ? questions?.length + 1 : 1}
          </p>
        </div>
      </div>
    </div>
  );
}

function SingleQuestionCard({
  isEditing,
  index,
  question,
}: {
  index: number;
  question: TQuestion;
  isEditing?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full flex items-center rounded-lg p-3 border h-36  flex-col gap-6",
        isEditing && " border-basePrimary"
      )}
    >
      <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
        {index + 1}
      </p>

      <div
        className="innerhtml items-center text-sm w-full line-clamp-3"
        dangerouslySetInnerHTML={{
          __html: question?.question ?? "",
        }}
      />
    </div>
  );
}
