"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";

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
              isForm
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
              className="innerhtml w-full p-3 rounded-lg bg-white/10 border"
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
                className="w-full h-[10rem] rounded-lg object-cover"
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

function CheckBoxSettings({
  optionType,
  setOption,
}: {
  optionType: string;
  setOption: (value: string) => void;
}) {
  const options = [
    {
      name: "Mutiple Choice",
      image: "/fmultiplechoice.png",
      type: "INPUT_MULTIPLE_CHOICE",
    },
    { name: "CheckBox", image: "/fcheckbox.png", type: "INPUT_CHECKBOX" },
    { name: "Dropdown", image: "/fcontact.svg", type: "DROPDOWN" },
  ];

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <p className="mb-4 px-3 font-medium underline">Option Types</p>
      {options.map((option) => (
        <label className="flex p-2 items-center gap-x-1">
          <input
            onChange={(e) => {
              setOption(option.type);
            }}
            value={option.type}
            type="checkbox"
            checked={optionType === option.type}
            className="h-[18px] pt-3 w-[18px] rounded-full mr-2 accent-basePrimary"
          />
          <span className="capitalize text-mobile">{option.name}</span>
        </label>
      ))}
    </div>
  );
}

export function FormCheckBoxType({
  form,
  defaultQuestionValue,
  question,
  engagementForm,
  refetch,
  setOption,
  optionType,
  btnColor
}: {
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  question: TEngagementFormQuestion["questions"][number] | null;
  engagementForm: TEngagementFormQuestion;
  defaultQuestionValue: string;
  refetch: () => Promise<any>;
  setOption: (value: string) => void;
  optionType: string;
  btnColor:string;
}) {
  const addedImage = form.watch("questionImage");
  const addedDescription = form.watch("questionDescription");
  const prevSelectedOptions = form.watch(`optionFields`);
  const settings = form.watch("questionSettings");
  const [order, setOrder] = useState(settings || { inOrder: true });
  const [options, setOptions] = useState<OptionItemsType[]>(
    prevSelectedOptions || [{ id: nanoid(), option: "", optionImage: "" }]
  );

  function removeOption(id: string) {
    if (options?.length === 1) return;
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

  useEffect(() => {
    form.setValue("questionSettings", order);
  }, [order]);

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

  const showDescription = useWatch({
    control: form.control,
    name: "showDescription",
  });


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
        btnColor={btnColor}
        SettingWidget={
          <>
            <div className="flex w-full px-3 mb-4 items-center justify-between">
              <p className="text-mobile">Alphabetical Order</p>
              <Switch
                checked={order.inOrder}
                onClick={(e) => {
                  e.preventDefault();
                  setOrder({ inOrder: !order.inOrder });
                }}
                className=""
              />
            </div>
            <div className="flex w-full px-3 mb-4 items-center justify-between">
              <p className="text-mobile">Randomized</p>
              <Switch
                checked={!order.inOrder}
                onClick={(e) => {
                  e.preventDefault();
                  setOrder({ inOrder: !order.inOrder });
                }}
                className=""
              />
            </div>
            <CheckBoxSettings key={optionType} optionType={optionType} setOption={setOption} />
          </>
        }
      />

   
{showDescription && (
          <FormQuestionDescription
            defaultDescriptionValue={defaultDescriptionValue}
            form={form}
          />
        )}

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
          style={{
            color:btnColor
          }}
          className="w-fit h-fit px-0 mt-3 text-basePrimary text-sm underline"
        >
          Add New Option
        </Button>
      </div>
    </div>
  );
}
