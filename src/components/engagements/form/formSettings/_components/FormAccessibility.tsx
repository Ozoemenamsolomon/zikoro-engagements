"use client";

import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
export function FormAccessibility({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
}) {
  const isRedirectUrl = useWatch({
    control: form.control,
    name: "formSettings.isRedirectUrl",
  });

  const connectToEvent = useWatch({
    control: form.control,
    name: "formSettings.connectToEvent",
  });
  const isCollectEmail = useWatch({
    control: form.control,
    name: "formSettings.isCollectEmail",
  });
  const isCollectPhone = useWatch({
    control: form.control,
    name: "formSettings.isCollectPhone",
  });
  const showResult = useWatch({
    control: form.control,
    name: "formSettings.showResult",
  });
  const redirectUrl = useWatch({
    control: form.control,
    name: "formSettings.redirectUrl",
  });
  //
  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      {connectToEvent && (
        <>
          <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <p>Collect User Email</p>
            </div>
            <Switch
              checked={isCollectEmail}
              onCheckedChange={(checked) =>
                form.setValue("formSettings.isCollectEmail", checked)
              }
              className=""
            />
          </div>
          <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <p>Collect User Phone Number</p>
            </div>
            <Switch
              checked={isCollectPhone}
              onCheckedChange={(checked) =>
                form.setValue("formSettings.isCollectPhone", checked)
              }
              className=""
            />
          </div>
        </>
      )}

      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Show Form Result</p>
          <p className="text-xs text-gray-500">
            User will see how the fill form immediately after the filling the
            form
          </p>
        </div>
        <Switch
          checked={showResult}
          onCheckedChange={(checked) =>
            form.setValue("formSettings.showResult", checked)
          }
          className=""
        />
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="w-11/12 flex flex-col items-start justify-start">
          <p className="font-medium text-mobile sm:text-sm">
            Redirect your form partcipants to your website of choice
          </p>
          <p className="text-xs  text-gray-500">
            Users will be redicted to the url you have provided when the form is
            completed.
          </p>
        </div>

        <Switch
          // disabled={loading}
          checked={isRedirectUrl}
          onCheckedChange={(checked) => {
            form.setValue("formSettings.isRedirectUrl", checked);
          }}
        />
      </div>
      {isRedirectUrl && (
        <div className="flex flex-col w-full max-w-[350px] items-start justify-start gap-y-3">
          <FormField
            control={form.control}
            name="formSettings.redirectUrl"
            render={({ field }) => (
              <InputOffsetLabel label="Redirect URL">
                <Input
                  placeholder="Redirect URL (Start with https://) e.g https://"
                  type="text"
                  defaultValue={redirectUrl}
                  {...form.register("formSettings.redirectUrl")}
                  className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                />
              </InputOffsetLabel>
            )}
          />
        </div>
      )}
    </div>
  );
}
