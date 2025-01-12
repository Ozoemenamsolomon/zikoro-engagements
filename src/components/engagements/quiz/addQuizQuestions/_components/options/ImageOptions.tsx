import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { OptionAction } from "./action/OptionAction";
import Image from "next/image";
import {
    FieldArrayWithId,
    UseFieldArrayRemove,
    UseFormReturn,
  } from "react-hook-form";
  import { z } from "zod";
  import { quizQuestionSchema } from "@/schemas/quiz";
import { useMemo } from "react";

export function ImageOptions({
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
    <div className="w-full flex items-start justify-start gap-4">
    {fields.map((field, index) => (
      <SingleImageOption
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
      Add image option
    </button>
  </div>
  );
}

function SingleImageOption({
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
    fields: FieldArrayWithId<
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
    >[];
    index: number;
    handleRadioChange: (i: number) => void;
  }) {

    const questionImg = form.watch(`options.${index}.option` as const);
    const addedImage = useMemo(() => {
      if (typeof questionImg === "string") {
        return questionImg;
      } else if (questionImg && questionImg[0]) {
        return URL.createObjectURL(questionImg[0]);
      } else {
        return null;
      }
    }, [questionImg]);
  return (
    <div className="w-full sm:w-[150px]">
      <OptionAction
      isDisabled={fields.length === 1}
      index={index}
      remove={remove}
      field={field}
      form={form}
      handleRadioChange={handleRadioChange}
      interactionType=""
      />
      <label
        id="selectedOption"
        className="w-full flex items-center bg-basePrimary-100 rounded-lg justify-center flex-col gap-4 relative  h-[150px]"
      >
        {addedImage ? (
          <Image
            className="w-ful object-cover h-full rounded-lg inset-0 absolute z-10"
            src={addedImage}
            alt=""
            width={400}
            height={400}
          />
        ) : (
          <>
            <InlineIcon icon="ic:twotone-image" fontSize={50} />
            <p>Upload Image</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          hidden
          {...form.register(`options.${index}.option` as const)}
          className="w-full h-full inset-0 absolute z-20"
        />
      </label>
    </div>
  );
}
