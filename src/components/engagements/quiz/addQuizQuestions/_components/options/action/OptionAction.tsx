import { QuizUncheckIcon } from "@/constants";
import { cn } from "@/lib/utils";
import { quizQuestionSchema } from "@/schemas/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { FieldArrayWithId, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { z } from "zod";

export function OptionAction({isDisabled, index, remove, interactionType, handleRadioChange, field, form}:{  
    
    form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
    field: FieldArrayWithId<
      {
        question: string;
        options: {
          option: any;
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
    interactionType:string; index: number; remove: UseFieldArrayRemove; isDisabled:boolean }) {
    
    return (
        <div className="w-full flex items-center justify-between mb-1">
            <label
                    className={cn(
                      "flex items-center gap-x-2",
                      interactionType === "poll" && "hidden"
                    )}
                    htmlFor={`set-ans-${index}`}
                  >
                       <QuizUncheckIcon />
                       <p>Option {index}</p>
                    <input
                      {...form.register(`options.${index}.isAnswer` as const)}
                      type="radio"
                      name={`isAnswer`}
                      id={`set-ans-${index}`}
                      value={field.optionId}
                      hidden
                      onChange={() => handleRadioChange(index)}
                     // className="h-5 w-5 accent-basePrimary"
                    />
                  </label>
    
        <button
        disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            remove(index)
          }}
        >
          <InlineIcon
            icon="icon-park-twotone:close-one"
            color="#dc2626"
            fontSize={16}
          />
        </button>
      </div>
    )
}