"use client";

import { formQuestion } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";
import { Slider } from "@mui/material";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";

export function FormTextType({
  form,
  defaultQuestionValue,
  question,
  engagementForm,
  refetch,
  btnColor
}: {
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  question: TEngagementFormQuestion["questions"][number] | null;
  engagementForm: TEngagementFormQuestion;
  defaultQuestionValue: string;
  refetch: () => Promise<any>;
  btnColor:string
}) {
  const addedImage = form.watch("questionImage");
  const addedDescription = form.watch("questionDescription");
  const [selectedType, setSelectedType] = useState("");
  const selectedOptions = useWatch({
    control: form.control,
    name: `questionSettings` as const,
  });

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

  useEffect(() => {
    if (selectedType === "Unlimited") {
      form.setValue("questionSettings", null);
    }
  }, [form, selectedType]);

  const showDescription = useWatch({
    control: form.control,
    name: "showDescription",
  });

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
          btnColor={btnColor}
          type="Text"
          isText
          SettingWidget={
            <div className="w-full flex flex-col gap-3 px-3">
              <p className="text-mobile text-start">Max. Character Length</p>
              <Select
                onValueChange={(value) => {
                  setSelectedType(value);
                }}
                defaultValue={selectedType}
              >
                <SelectTrigger className="h-11 w-[150px]">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    {["Limited", "Unlimited"].map((value, index) => (
                      <SelectItem
                        key={index}
                        className="h-10 items-center justify-start focus:bg-gray-100"
                        value={value}
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedType === "Limited" && (
                <div className="w-full grid items-center justify-center grid-cols-12">
                  <span className="text-center text-mobile">0</span>
                  <div className="col-span-10 w-full">
                    <Slider
                      min={0}
                      max={1000}
                      step={1}
                      size="small"
                      value={selectedOptions ?? 0}
                      className="w-full h-1"
                      onChange={(_, e) => {
                        form.setValue("questionSettings", e as number);
                      }}
                      sx={{
                        color: "#6b7280",
                        height: 4,
                        padding: 0,
                        "& .MuiSlider-thumb": {
                          width: 8,
                          height: 8,
                          backgroundColor: "#ffffff",
                          transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                          "&:before": {
                            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
                          },
                          "&:hover, &.Mui-focusVisible": {
                            boxShadow: `0px 0px 0px 6px #001fcc`,
                          },
                        },
                        "& .MuiSlider-track": {
                          backgroundColor: "#001fcc",
                        },
                        "& .MuiSlider-rail": {
                          backgroundColor: "#6b7280",
                        },
                      }}
                    />
                  </div>

                  <span className="text-center text-mobile">{1000}</span>
                </div>
              )}
            </div>
          }
        />

        {showDescription && (
          <FormQuestionDescription
            defaultDescriptionValue={defaultDescriptionValue}
            form={form}
          />
        )}
      </div>
    </>
  );
}
