import { TextEditor } from "@/components/custom";
import { formQuestion } from "@/schemas";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export function FormQuestionDescription({
  defaultDescriptionValue,
  form,
}: {
  defaultDescriptionValue: string;
  form: UseFormReturn<z.infer<typeof formQuestion>>;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <>
      {
        <div className="w-full" id="select-description">
          {isFocused ? (
            <div className="w-full">
              <TextEditor
                defaultValue={defaultDescriptionValue}
                placeholder="Enter your Description"
                onChange={(value) => {
                  form.setValue("questionDescription", value);
                }}
                //  key={defaultDescriptionValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
          ) : (
            <div
              onClick={() => setIsFocused(true)}
              className="innerhtml w-full p-3 rounded-lg bg-basePrimary-100"
              dangerouslySetInnerHTML={{
                __html: defaultDescriptionValue || "Enter Your Feedback",
              }}
            />
          )}
        </div>
      }
    </>
  );
}
