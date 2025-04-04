import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import { TEngagementFormQuestion } from "@/types/form";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

export function AddedFormQuestions({
  className,
  questions,
  editingQuestion,
  editQuestion,
  addNewQuestion,
  isAddNew,
  toggleEndScreen,
}: {
  questions: TEngagementFormQuestion["questions"];
  className?: string;
  editingQuestion: TEngagementFormQuestion["questions"][number] | null;
  editQuestion: (t: TEngagementFormQuestion["questions"][number]) => void;
  addNewQuestion: () => void;
  toggleEndScreen: () => void;
  isAddNew: boolean;
}) {
  const [isNew, setIsNew] = useState(false);
  return (
    <div
      className={cn(
        "w-full bg-white vert-scroll pb-40 h-full sm:mt-8 border overflow-y-auto rounded-lg col-span-full sm:col-span-3 pt-6  px-3",
        className,
        editingQuestion !== null && "hidden sm:block",
        isAddNew && "hidden sm:block"
      )}
    >
      <div className="w-full mb-6 flex items-center justify-between">
        <p className="">
          No. Questions:
          <span className="font-semibold text-basePrimary">
            {questions?.length}
          </span>
        </p>

        <Button
          className="w-fit h-fit px-0 gap-x-1"
          onClick={() => {
            addNewQuestion();
            setIsNew(true);
          }}
        >
          <InlineIcon
            icon="icon-park-twotone:add-one"
            fontSize={18}
            color="#001fcc"
          />
          <p className="font-medium text-basePrimary">Add Question</p>
        </Button>
      </div>
      <div className="w-full flex  flex-col items-start justify-start gap-3">
        {Array.isArray(questions) &&
          questions?.map((quest, index) => (
            <div
              className="w-full"
              onClick={() => {
                editQuestion(quest);
                setIsNew(false);
              }}
              key={quest?.questionId}
            >
              <SingleFormQuestionCard
                index={index}
                question={quest}
                isEditing={
                  editingQuestion !== null &&
                  editingQuestion?.questionId === quest?.questionId
                }
              />
            </div>
          ))}
        <div
          className={cn(
            "w-full rounded-lg  border  h-36 hidden items-center justify-center",
            editingQuestion === null && "border-basePrimary",
            isNew && "flex"
          )}
        >
          <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
            {Array.isArray(questions) ? questions?.length + 1 : 1}
          </p>
        </div>
      </div>
      <div
        onClick={toggleEndScreen}
        className={cn(
          "w-full flex items-center mt-3 border-basePrimary rounded-lg p-3 border h-36  flex-col gap-4"
        )}
      >
        <p className="text-basePrimary font-semibold text-base sm:text-lg">
          End Screen
        </p>
        <p className="text-center"> Click to customize end screen appearance</p>
      </div>
    </div>
  );
}

export function SingleFormQuestionCard({
  isEditing,
  index,
  question,
}: {
  index: number;
  question: TEngagementFormQuestion["questions"][number];
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
