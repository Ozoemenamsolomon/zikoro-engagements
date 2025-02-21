"use client";

import { formQuestion } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";
import { DateRange } from "styled-icons/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function FormDateType({
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
  const [isDatePanel, setDatePanel] = useState(false);
  const selectedOptions = useWatch({
    control: form.control,
    name: `questionSettings` as const,
  });
  const [startDate, setStartDate] = useState<Date | null>(
    selectedOptions ? selectedOptions?.start : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    selectedOptions ? selectedOptions?.end : null
  );
  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

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
    if (startDate !== null && endDate !== null) {
      form.setValue("questionSettings", { start: startDate, end: endDate });
    }
  }, [startDate, endDate]);

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
          type="Date"
          isNotOverflow
          SettingWidget={
            <button
              onClick={() => setDatePanel((prev) => !prev)}
              className="flex px-3 py-2 relative  items-center w-full  gap-x-2"
            >
              <p className="text-sm"> Select Range </p>
              <DateRange size={22} />
              {isDatePanel && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="absolute top-8 right-[-95px] md:right-0"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDatePanel((prev) => !prev);
                    }}
                    className="w-full h-full fixed inset-0 z-[150] "
                  ></button>
                  <div
                    role="button"
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-[300]"
                  >
                    <DatePicker
                      selected={startDate}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={onChange}
                      selectsRange
                      inline
                    />
                  </div>
                </div>
              )}
            </button>
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
