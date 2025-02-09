"use client";

import { Button } from "@/components/custom";
import { CreateForm } from "@/components/dashboard/_components/create/CreateForm";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formSettingSchema } from "@/schemas";
import { TEngagementFormQuestion } from "@/types/form";
import { TOrganization } from "@/types/home";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormAccessibility, FormIntegration } from "./_components";
import FormAppearance from "./_components/FormAppearance";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { usePostRequest } from "@/hooks/services/requests";

export enum FormSettingType {
  details,
  accessibility,
  appearance,
  integration,
}

export function FormSettings({
  close,
  refetch,
  organization,
  engagementForm,
}: {
  engagementForm: TEngagementFormQuestion;
  close: () => void;
  refetch: () => Promise<any>;
  organization: TOrganization;
}) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<FormSettingType>(
    FormSettingType.details
  );
  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const form = useForm<z.infer<typeof formSettingSchema>>({
    resolver: zodResolver(formSettingSchema),
    defaultValues: {
      title: engagementForm?.title,
      coverImage: engagementForm?.coverImage,
      description: engagementForm?.description,
      formSettings: {
        ...engagementForm?.formSettings,
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSettingSchema>) {
    setLoading(true);
    const payload: Partial<TEngagementFormQuestion> = {
      ...engagementForm,
      ...values,
    };
    await postData({ payload });
    setLoading(false);
  }
  return (
    <div
      onClick={close}
      className="w-screen h-screen fixed inset-0 bg-white/50 z-[100] "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="right-0 min-h-screen animate-float-in border vert-scroll inset-y-0 absolute max-w-3xl w-full bg-white overflow-y-auto"
      >
        <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
          <div className="w-full flex items-center justify-between">
            <h2>Form Settings</h2>
            <Button
              onClick={close}
              className="h-10 w-10 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
            >
              <InlineIcon
                icon={"mingcute:close-line"}
                fontSize={22}
                color="#ffffff"
              />
            </Button>
          </div>

          <div className="w-fit flex my-6 mx-auto items-center justify-center">
            {["Details", "Accessibility", "Appearance", "Integration"].map(
              (v, index) => (
                <button
                  onClick={() => setActive(index)}
                  className={cn(
                    "px-6 py-3 border-b-2",
                    active === index && "text-basePrimary border-basePrimary"
                  )}
                >
                  {v}
                </button>
              )
            )}
          </div>
          {FormSettingType.details === active && (
            <CreateForm
              engagementForm={engagementForm}
              refetch={refetch}
              organization={organization}
            />
          )}

          {active > FormSettingType.details && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col items-start justify-start "
              >
                {FormSettingType.accessibility === active && (
                  <FormAccessibility form={form} />
                )}
                {FormSettingType.appearance === active && (
                  <FormAppearance form={form} />
                )}
                {FormSettingType.integration === active && (
                  <FormIntegration form={form} />
                )}
                <Button
                  disabled={loading}
                  className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
                >
                  {loading && <LoaderAlt size={20} className="animate-spin" />}
                  <p> Update</p>
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
