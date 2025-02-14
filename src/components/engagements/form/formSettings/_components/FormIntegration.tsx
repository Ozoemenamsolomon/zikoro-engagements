"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import { useGetUserEngagements } from "@/hooks/services/engagement";
import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/custom";

type EngagementList = {
  value: string;
  label: string;
  type: string;
};

function AddEngagement({
  engagementList,
  form,
}: {
  engagementList: EngagementList[];
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
}) {
  const [isOpen, setOpen] = useState(false);
  const selectedEngagement = useWatch({
    control: form.control,
    name: "formSettings.engagementId",
  });

  const selectedName = useMemo(() => {
    return (
      engagementList.find((e) => e.value === selectedEngagement)?.label ?? null
    );
  }, [selectedEngagement]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setOpen(true);
      }}
      className="w-full max-w-lg bg-basePrimary-100 flex items-center justify-start px-4 rounded-lg h-11 relative"
    >
      <p>{selectedName ?? "Select Engagement"}</p>
      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="absolute w-full inset-x-0 top-[2.80rem]"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(false);
            }}
            className="w-full fixed h-full inset-0 z-[100]"
          ></div>
          <div className="w-full  z-[300] bg-white shadow relative h-fit max-h-[300px] px-3 py-4 overflow-y-auto rounded-lg vert-scroll">
            <div className="w-full flex flex-col justify-start items-start">
              {engagementList.map((eng, index) => (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    form.setValue("formSettings.engagementId", eng.value);
                    form.setValue("formSettings.engagementType", eng.type);
                    setOpen(false);
                  }}
                  role="button"
                  key={index}
                  className={cn(
                    "w-full flex items-center p-3 justify-between hover:bg-basePrimary-100"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {selectedEngagement === eng.value ? (
                      <div className="h-4 w-4 rounded-full bg-basePrimary"></div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-basePrimary border"></div>
                    )}
                    <p>{eng.label}</p>
                  </div>
                  <p className="rounded-3xl capitalize px-2 py-1 text-mobile sm:text-sm gradient-text bg-basePrimary border border-basePrimary">
                    {eng.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormIntegration({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
}) {
  const {
    qas,
    qaLoading,
    quizLoading,
    quizzes,
    forms,
    formLoading,
  } = useGetUserEngagements();

  const filteredData = useMemo(() => {
    if (!qaLoading && !quizLoading && !formLoading) {
      const newqas = Array.isArray(qas)
        ? qas?.map((v) => {
            return {
              value: v?.QandAAlias,
              label: v?.coverTitle,
              type: "Q & A",
            };
          })
        : [];
      const newQuizzes = Array.isArray(quizzes)
        ? quizzes?.map((v) => {
            return {
              value: v?.quizAlias,
              label: v?.coverTitle,
              type: "quiz",
            };
          })
        : [];
      return [...newQuizzes, ...newqas];
    } else return [];
  }, [qaLoading, quizLoading, formLoading, forms, quizzes, qas]);

  const isConnectedToEngagement = useWatch({
    control: form.control,
    name: "formSettings.isConnectedToEngagement",
  });
  const showForm = useWatch({
    control: form.control,
    name: "formSettings.showForm",
  });

  return (
    <div className="w-full flex  flex-col items-start justify-start gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="w-11/12 flex flex-col items-start justify-start">
          <p className="font-medium text-mobile sm:text-sm">
            Connect form with other engagement
          </p>
          <p className="text-xs  text-gray-500">
            Embed your form into any engagement, allowing users to fill it out
            either before or after engagement.
          </p>
        </div>

        <Switch
          checked={isConnectedToEngagement}
          onCheckedChange={(checked) => {
            form.setValue("formSettings.isConnectedToEngagement", checked);
          }}
        />
      </div>
      {isConnectedToEngagement && (
        <AddEngagement
          form={form}
          engagementList={filteredData as EngagementList[]}
        />
      )}

      {isConnectedToEngagement && (
        <div className="flex flex-col items-start justify-start gap-y-3">
          <p className="font-medium text-mobile sm:text-sm">
            When should user take this form
          </p>
          <div className="w-fit h-fit flex items-center bg-basePrimary-100 p-1 border rounded-xl">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                form.setValue("formSettings.showForm", "beforeEngagement");
              }}
              className={cn(
                "h-11 rounded-xl text-mobile sm:text-sm font-medium w-fit px-6",
                showForm === "beforeEngagement" && "bg-white  "
              )}
            >
              Before Engagement
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                form.setValue("formSettings.showForm", "afterEngagement");
              }}
              className={cn(
                "h-11 rounded-xl text-mobile sm:text-sm font-medium w-fit px-6",
                showForm === "afterEngagement" && "bg-white  "
              )}
            >
              After Engagement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

//
