"use client";

import { formQuestion } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatText } from "@/utils";

export type ContactType = {
  firstName: boolean;
  lastName: boolean;
  phoneNumber: boolean;
  email: boolean;
  company: boolean;
};

export function FormContactType({
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

  const selectedOptions = useWatch({
    control: form.control,
    name: `questionSettings` as const,
  });
  const [selectedType, setSelectedType] = useState<ContactType>(
    selectedOptions || {
      firstName: false,
      lastName: false,
      phoneNumber: false,
      email: false,
      company: false,
    }
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

  useEffect(() => {
    if (selectedType) {
      form.setValue("questionSettings", selectedType);
    }
  }, [form, selectedType]);
  const order = ["firstName", "lastName", "phoneNumber", "email", "company"];

  function togggleRequired(isRequired:boolean) {
    if (isRequired) {
      setSelectedType({
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        company: true,
      });

      return;
    }

    if (!isRequired) {
      setSelectedType({
        firstName: false,
        lastName: false,
        phoneNumber: false,
        email: false,
        company: false,
      });

      return;
    }
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
          type="Contact"
          isTemplateType
          togggleRequired={togggleRequired}
          SettingWidget={
            <div className="w-full flex flex-col px-3 items-start justify-start gap-4">
              {order.map((key) => (
                <div
                  key={key}
                  className="w-full flex items-center justify-between"
                >
                  <p className="flex items-center gap-x-2">
                    {selectedType[key as keyof ContactType] ? (
                      <InlineIcon icon="famicons:eye" fontSize={18} />
                    ) : (
                      <InlineIcon
                        icon="mdi:eye-off"
                        color="#9ca3af"
                        fontSize={18}
                      />
                    )}
                    <span
                      className={cn(
                        "capitalize text-mobile",
                        !selectedType[key as keyof ContactType] &&
                          "text-gray-400"
                      )}
                    >
                      Require {formatText(key)}
                    </span>
                  </p>
                  <Switch
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (selectedType[key as keyof ContactType]) {
                        form.setValue('isRequired', false)
                      }

                      setSelectedType((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof ContactType],
                      }));
                    }}
                    checked={selectedType[key as keyof ContactType]}
                    className=""
                  />
                </div>
              ))}
            </div>
          }
        />

        <FormQuestionDescription
          defaultDescriptionValue={defaultDescriptionValue}
          form={form}
        />
        <div className="w-full flex flex-col items-start justify-start">
          <p className="w-full border-b p-3">First Name</p>
          <p className="w-full border-b p-3">Last Name</p>
          <p className="w-full border-b p-3">Phone Number</p>
          <p className="w-full border-b p-3">Email</p>
          <p className="w-full border-b p-3">Company</p>
        </div>
      </div>
    </>
  );
}
