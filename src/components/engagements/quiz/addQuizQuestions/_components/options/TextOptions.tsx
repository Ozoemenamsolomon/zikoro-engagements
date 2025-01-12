import { TextEditor } from "@/components/custom";
import { useState } from "react";
import { OptionAction } from "./action/OptionAction";
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { quizQuestionSchema } from "@/schemas/quiz";

export function TextOptions({
  remove,
  fields,
  appendOption,
  form,
}: {
  appendOption: () => void;
  remove: UseFieldArrayRemove;
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
  fields: FieldArrayWithId<
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
  >[];
}) {
  function handleRadioChange(id: number) {
    const fields = form.watch("options");
    const optionId = form.getValues(`options.${id}.optionId`);

    // option: index === id ? option : field.option,
    const updatedField = fields.map((field, index) => {
      if (index === id) {
        return {
          ...field,

          isAnswer: optionId,
        };
      }

      return { ...field };
    });

    form.setValue("options", updatedField);
  }
  return (
    <div className="w-full flex flex-col items-start justify-start gap-4">
      {fields.map((field, index) => (
        <SingleOption
          index={index + 1}
          fields={fields}
          key={field.id}
          field={field}
          remove={remove}
          form={form}
          handleRadioChange={handleRadioChange}
        />
      ))}

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          appendOption();
        }}
        className="text-basePrimary mt-4"
      >
        Add text option
      </button>
    </div>
  );
}

function SingleOption({
  field,
  fields,
  remove,
  index,
  form,
  handleRadioChange,
}: {
  remove: UseFieldArrayRemove;
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
  fields: FieldArrayWithId<
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
  >[];
  index: number;
  handleRadioChange: (i: number) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const addedOption = form.watch(`options.${index}.option` as const);
  const {
    formState: { errors },
  } = form;
  return (
    <div id="select-option" className="w-full">
      <OptionAction
        isDisabled={fields.length === 1}
        index={index}
        remove={remove}
        field={field}
        form={form}
        handleRadioChange={handleRadioChange}
        interactionType=""
      />
      {isFocused ? (
        <div className="w-full">
          <TextEditor
            onChange={(value) => {
              form.setValue(`options.${index}.option` as const, value);
            }}
            error={errors?.options ? errors?.options[index]?.message : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsFocused(true)}
          className="innerhtml w-full p-3 rounded-lg bg-basePrimary-100"
          dangerouslySetInnerHTML={{
            __html: addedOption || "Enter Option",
          }}
        />
      )}
    </div>
  );
}
