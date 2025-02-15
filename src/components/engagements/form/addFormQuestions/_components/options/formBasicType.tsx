"use client";

import { formQuestion } from "@/schemas";
import {  useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormQuestionDescription } from "../formQuestionDescription";
import { TEngagementFormQuestion } from "@/types/form";
import { FormQuestionField } from "../formQuestionField";


export function FormBasicType({
  form,
  defaultQuestionValue,
  question,
  engagementForm,
  refetch,
  type,
}: {
  form: UseFormReturn<z.infer<typeof formQuestion>>;
  question: TEngagementFormQuestion["questions"][number] | null;
  engagementForm: TEngagementFormQuestion;
  defaultQuestionValue: string;
  refetch: () => Promise<any>;
  type: string;
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
          type={type}
        />

        <FormQuestionDescription
          defaultDescriptionValue={defaultDescriptionValue}
          form={form}
        />
      </div>
    </>
  );
}
