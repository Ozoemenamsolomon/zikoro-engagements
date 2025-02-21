"use client";

import { formQuestion } from "@/schemas";
import { useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";

export function FormYesNoType({
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
  //   const [selectedType, setSelectedType] = useState("");
  //   const selectedOptions = useWatch({
  //     control: form.control,
  //     name: `optionFields` as const,
  //   });

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

  //   useEffect(() => {
  //     if (selectedType === "Unlimited") {
  //       form.setValue("optionFields", null);
  //     }
  //   }, [form, selectedType]);

  const showDescription = useWatch({
    control: form.control,
    name: 'showDescription'
  })
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
          type="Yes or No"
        />

{showDescription && (
          <FormQuestionDescription
            defaultDescriptionValue={defaultDescriptionValue}
            form={form}
          />
        )}

        <div className="w-full flex items-center justify-center gap-x-6">
          <div className="bg-basePrimary-100 flex items-center gap-x-2 rounded-lg p-2">
            <p className="font-bold rounded-lg text-2xl h-11 w-11 flex items-center justify-center border border-black">
              Y
            </p>
            <p className="text-sm">Yes</p>
          </div>

          <div className="bg-basePrimary-100 flex items-center gap-x-2 rounded-lg p-2">
            <p className="font-bold rounded-lg text-2xl h-11 w-11 flex items-center justify-center border border-black">
              N
            </p>
            <p className="text-sm">No</p>
          </div>
        </div>
      </div>
    </>
  );
}
