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

export type AddressType = {
  address_1: boolean;
  address_2: boolean;
  city: boolean;
  state: boolean;
  zip_code: boolean;
  country: boolean;
};

export function FormAddressType({
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
  const isRequired = useWatch({
    control: form.control,
    name: "isRequired",
  });
  const [selectedType, setSelectedType] = useState<AddressType>(
    selectedOptions || {
      address_1: false,
      address_2: false,
      city: false,
      state: false,
      zip_code: false,
      country: false,
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

  function toggleRequired(isRequired: boolean) {
    if (isRequired) {
      setSelectedType({
        address_1: true,
        address_2: true,
        city: true,
        state: true,
        zip_code: true,
        country: true,
      });

      return;
    }

    if (!isRequired) {
      setSelectedType({
        address_1: false,
        address_2: false,
        city: false,
        state: false,
        zip_code: false,
        country: false,
      });

      return;
    }
  }

  const order = [
    "address_1",
    "address_2",
    "city",
    "state",
    "zip_code",
    "country",
  ];

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
          type="Address"
          isTemplateType
          togggleRequired={toggleRequired}

          SettingWidget={
            <div className="w-full flex flex-col px-3 items-start justify-start gap-3">
              {order.map((key) => (
                <div
               
                  key={key}
                  className="w-full flex items-center justify-between"
                >
                  <p className="flex items-center gap-x-2">
                    {selectedType[key as keyof AddressType] ? (
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
                        "capitalize",
                        !selectedType[key as keyof AddressType] &&
                          "text-gray-400"
                      )}
                    >
                      Require {formatText(key)}
                    </span>
                  </p>
                  <Switch
                    checked={selectedType[key as keyof AddressType]}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (selectedType[key as keyof AddressType]) {
                          form.setValue('isRequired', false)
                        }
    
                        setSelectedType((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof AddressType],
                        }));
                      }}
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
          <p className="w-full border-b p-3">Address 1</p>
          <p className="w-full border-b p-3">Address 2</p>
          <p className="w-full border-b p-3">City</p>
          <p className="w-full border-b p-3">State</p>
          <p className="w-full border-b p-3">Zip Code</p>
          <p className="w-full border-b p-3">Country</p>
        </div>
      </div>
    </>
  );
}
