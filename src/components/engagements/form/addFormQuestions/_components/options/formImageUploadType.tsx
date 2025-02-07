"use client";

import { formQuestion } from "@/schemas";
import { useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";
import Image from "next/image";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import { QuizUncheckIcon } from "@/constants";
import { nanoid } from "nanoid";
import { Button } from "@/components/custom";

type UploadOptionItemsType = {
  id: string;
  image: string;
};

function UploadOptionItem({
  index,
  removeOption,
  option,
  setOption,
}: {
  index: number;
  setOption: (id: string, value: string) => void;
  option: UploadOptionItemsType;
  removeOption: (id: string) => void;
}) {
  return (
    <div className="w-[200px] ">
      <div className="flex items-center justify-between w-full mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={cn("flex items-center gap-x-2")}
       
        >
          <QuizUncheckIcon />
          <p>Option {index}</p>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            removeOption(option.id);
          }}
        >
          <InlineIcon
            icon="icon-park-twotone:close-one"
            color="#dc2626"
            fontSize={16}
          />
        </button>
      </div>
      <label
        htmlFor={`selectedOption${option?.id}`}
        className="w-full flex items-center bg-basePrimary-100 rounded-lg justify-center flex-col gap-4 relative  h-[150px]"
      >
        {option?.image ? (
          <Image
            className="w-ful object-cover h-full rounded-lg inset-0 absolute z-10"
            src={option?.image}
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
          id={`selectedOption${option?.id}`}
          type="file"
          accept="image/*"
          hidden
          className="w-full h-full inset-0 absolute z-20"
          onChange={(e) => {
            const fileList = e.target.files;
            if (fileList && fileList[0]) {
              const file = fileList[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setOption(option.id, reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }
          }}
        />
      </label>
    </div>
  );
}

export function FormImageUploadType({
  form,
  defaultQuestionValue,
  question,
  engagementForm,
  refetch,
}: {
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  question: TEngagementFormQuestion["questions"][number] | null;
  engagementForm: TEngagementFormQuestion;
  defaultQuestionValue: string;
  refetch: () => Promise<any>;
}) {
  const addedImage = form.watch("questionImage");
  const prevSelectedOptions = form.watch(`optionFields`);
  const addedDescription = form.watch("questionDescription");
  const [options, setOptions] = useState<UploadOptionItemsType[]>(
    prevSelectedOptions || [{ id: nanoid(), image: "" }]
  );

  const image = useMemo(() => {
    if (typeof addedImage === "string") {
      return addedImage;
    } else if (addedImage && addedImage[0] && addedImage instanceof FileList) {
      return URL.createObjectURL(addedImage[0]);
    } else {
      return null;
    }
  }, [addedImage]);

  const defaultDescriptionValue = useMemo(() => {
    if (typeof addedDescription === "string" && addedDescription?.length > 0) {
      return addedDescription;
    } else {
      return "";
    }
  }, [addedDescription]);

  function removeOption(id: string) {
    if (options?.length === 1) return;
    setOptions(options.filter((option) => option.id !== id));
  }

  function handleChangeOption(id: string, value: string) {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, image: value } : option
      )
    );
  }

  return (
    <>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <FormQuestionField
          defaultQuestionValue={defaultQuestionValue}
          addedImage={image}
          form={form}
          engagementForm={engagementForm}
          question={question}
          refetch={refetch}
          type="Image Upload"
          
        />

        <FormQuestionDescription
          defaultDescriptionValue={defaultDescriptionValue}
          form={form}
         
        />

        <div className="w-full flex flex-wrap justify-center items-center gap-3">
          {options?.map((option, index) => (
            <UploadOptionItem
              option={option}
              setOption={handleChangeOption}
              index={index}
              removeOption={removeOption}
            />
          ))}
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOptions([
              ...options,
              { id: nanoid(),  image: "" },
            ]);
          }}
          className="w-fit h-fit px-0 mt-3 text-basePrimary text-sm underline"
        >
          Add New Option
        </Button>
      </div>
    </>
  );
}
