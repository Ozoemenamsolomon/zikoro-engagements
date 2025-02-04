"use client";

import { UseFormReturn } from "react-hook-form";
import { FormQuestionDescription } from "../formQuestionDescription";
import { z } from "zod";
import { formQuestion } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { FormQuestionField } from "../formQuestionField";
import { TEngagementFormQuestion } from "@/types/form";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button, TextEditor } from "@/components/custom";
import { AddQuizImageIcon } from "@/constants";
import { MdClose } from "react-icons/md";

type OptionItemsType = {
  id: string;
  option: string;
  optionImage: string;
};

function OptionItem({
  option,
  index,
  setOption,
  removeImage,
  removeOption,
}: {
  index: number;
  setOption: (id: string, value: string, type: string) => void;
  option: OptionItemsType;
  removeImage: (id: string) => void;
  removeOption: (id: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <div className="w-full flex  items-center justify-between">
        <p>Option {index + 1}</p>

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
      <div className="w-full flex h-full gap-3 items-center ">
        <div className={cn("w-[97%]", option.optionImage && "w-[70%]")}>
          {isFocused ? (
            <div className="w-full">
              <TextEditor
                placeholder="Enter Text"
                defaultValue={option.option}
                onChange={(value) => {
                  setOption(option.id, value, "text");
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
          ) : (
            <div
              onClick={() => setIsFocused(true)}
              className="innerhtml w-full p-3 rounded-lg bg-basePrimary-100"
              dangerouslySetInnerHTML={{
                __html: option?.option || "Enter Text",
              }}
            />
          )}
        </div>
        <div className={cn("w-[3%]", option.optionImage && "w-[30%]")}>
          {option.optionImage ? (
            <div className="w-full h-full relative">
              <Image
                className="w-full h-full rounded-lg object-cover"
                src={option.optionImage}
                width={600}
                height={600}
                alt="image"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeImage(option.id);
                }}
                className="absolute px-0 top-[-1rem] h-6 w-6 rounded-full bg-[#001FCC19] right-[-0.4rem]"
              >
                <MdClose size={16} />
              </Button>
            </div>
          ) : (
            <label htmlFor={`optionImage${option.id}`}>
              <input
                hidden
                id={`optionImage${option.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const fileList = e.target.files;
                  if (fileList && fileList[0]) {
                    const file = fileList[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setOption(option.id, reader.result as string, "image");
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
              <AddQuizImageIcon />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function FormCheckBoxType({
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
  const addedDescription = form.watch("questionDescription");
  const prevSelectedOptions = form.watch(`optionFields`);
  const [options, setOptions] = useState<OptionItemsType[]>(
    prevSelectedOptions || [{ id: nanoid(), option: "", optionImage: "" }]
  );

  function removeOption(id: string) {
    setOptions(options.filter((option) => option.id !== id));
  }

  function removeImage(id: string) {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, optionImage: "" } : option
      )
    );
  }

  function handleChangeOption(id: string, value: string, type: string) {
    setOptions(
      options.map((option) =>
        option.id === id
          ? { ...option, [type === "image" ? "optionImage" : "option"]: value }
          : option
      )
    );
  }

   // form field
   useEffect(() => {
    if (options) {
      form.setValue(`optionFields`, options);
    }
  }, [options]);

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

  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <FormQuestionField
        defaultQuestionValue={defaultQuestionValue}
        addedImage={image}
        form={form}
        engagementForm={engagementForm}
        question={question}
        refetch={refetch}
        type="CheckBox"
     
      />

      <FormQuestionDescription
        defaultDescriptionValue={defaultDescriptionValue}
        form={form}
         
      />

      <div className="w-full flex flex-col items-start justify-start gap-3">
        {options.map((option, index) => (
          <OptionItem
            key={option.id}
            option={option}
            index={index}
            removeOption={removeOption}
            removeImage={removeImage}
            setOption={handleChangeOption}
          />
        ))}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOptions([
              ...options,
              { id: nanoid(), option: "", optionImage: "" },
            ]);
          }}
          className="w-fit h-fit px-0 mt-3 text-basePrimary text-sm underline"
        >
          Add New Option
        </Button>
      </div>
    </div>
  );
}
