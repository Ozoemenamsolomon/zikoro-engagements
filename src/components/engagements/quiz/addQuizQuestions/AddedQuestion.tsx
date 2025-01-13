import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import { TQuestion } from "@/types/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

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
  return (
    <div
      className={cn(
        "w-full bg-white h-full mt-8 border rounded-lg col-span-3 py-6 px-3",
        className
      )}
    >
      <div className="w-full flex items-center justify-between">
        <p className="mb-4">
          No. Questions:{" "}
          <span className="font-semibold text-basePrimary">
            {questions?.length}
          </span>
        </p>
        {/* <Button onClick={addNewQuestion}>
          <InlineIcon
            icon="icon-park-twotone:add-one"
            fontSize={28}
            color="#001fcc"
          />
        </Button> */}
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        {Array.isArray(questions) &&
          questions?.map((quest, index) => (
            <div className="w-full" onClick={() => editQuestion(quest)} key={quest?.id}>
              <SingleQuestionCard
                index={index}
                question={quest}
                isEditing={
                  editingQuestion !== null && editingQuestion?.id === quest?.id
                }
              />
            </div>
          ))}
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
        "w-full flex items-center rounded-lg p-3 border justify-center flex-col gap-6",
        isEditing && "border-basePrimary"
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
