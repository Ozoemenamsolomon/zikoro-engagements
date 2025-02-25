"use client";

import { formQuestion } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { HiOutlineStar } from "react-icons/hi";
import { Portal } from "@/components/custom/Portal";

export function FormRatingType({
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
  const prevSelectedRating = form.watch(`optionFields`);
  const [selectedRating, setSelectedRating] = useState(
    parseInt(prevSelectedRating) || 5
  );
  const [isOpen, setOpen] = useState(false);
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
    if (selectedRating) {
      form.setValue(`optionFields`, selectedRating);
    }
  }, [selectedRating]);
  function handleToggle() {
    setOpen((p) => !p);
  }


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
          type="Rating"
          isNotOverflow
          SettingWidget={
            <div className="w-full flex items-center gap-x-3 px-3">
              <p className="text-mobile">Choose Level:</p>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggle();
                  }}
                  className="border flex items-center gap-x-1 rounded-lg px-3 py-2"
                >
                  {selectedRating}
                  <MdOutlineKeyboardArrowDown
                    size={16}
                    className="text-gray-300"
                  />
                </button>

                {isOpen && (
                  <div className="absolute top-9">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpen(false);
                      }}
                      role="button"
                      className="w-full h-full inset-0 fixed z-[98]"
                    ></div>
                    
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="relative bg-white rounded-lg max-h-[250px]  overflow-y-auto no-scrollbar border w-[50px] z-[300]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedRating(value);
                            setOpen(false);
                          }}
                          className="w-full flex items-center text-zinc-700 justify-center p-2 hover:bg-gray-200"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          }
        />

{showDescription && (
          <FormQuestionDescription
            defaultDescriptionValue={defaultDescriptionValue}
            form={form}
          />
        )}

        <div className="w-full flex items-center gap-x-3 justify-center p-3">
          <div className="flex items-center gap-x-2">
            {[...Array(selectedRating)].map((_, index) => (
              <HiOutlineStar className="text-gray-300" size={28} key={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
