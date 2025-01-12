import { OptionCheckIcon, QuizUncheckIcon } from "@/constants";
import { cn } from "@/lib/utils";
import { quizQuestionSchema } from "@/schemas/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

export function OptionAction({
  isDisabled,
  index,
  remove,
  interactionType,
  handleRadioChange,
  field,
  form,
}: {
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
  field: FieldArrayWithId<
    {
      question: string;
      options: {
        option?: any;
        optionId: string;
        isAnswer: string;
      }[];
      interactionType: string;
      questionImage?: any;
      duration?: string | undefined;
      points?: string | undefined;
      feedBack?: any;
    },
    "options",
    "id"
  >;
  handleRadioChange: (i: number) => void;
  interactionType: string;
  index: number;
  remove: UseFieldArrayRemove;
  isDisabled: boolean;
}) {

  const isAnswered = useWatch({
    control: form.control,
    name: `options.${index-1}.isAnswer` as const,
  });
  return (
    <div className="w-full flex items-center justify-between mb-1">
      <button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
       handleRadioChange(index-1)
      }}
        className={cn(
          "flex items-center gap-x-2",
          interactionType === "poll" && "hidden"
        )}
       // htmlFor={`set-ans-${index}`}
      >
       {isAnswered === field.optionId ? <OptionCheckIcon/>  : <QuizUncheckIcon />}
        <p>Option {index}</p>
    
      </button>

      <button
      
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log("cliked", index)
   if (!isDisabled)  remove(index-1);
        }}
      >
        <InlineIcon
          icon="icon-park-twotone:close-one"
          color="#dc2626"
          fontSize={16}
        />
      </button>
    </div>
  );
}
