"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import {
  useGetOrganizationEvents,
  useGetUserEngagements,
} from "@/hooks/services/engagement";
import { useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import _ from "lodash";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { TOrganization } from "@/types/home";
import { PlusCircle } from "styled-icons/bootstrap";
import { Button, ReactSelect } from "@/components/custom";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { FormField } from "@/components/ui/form";

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
    if (selectedEngagement) {
      return engagementList.find((e) => e.value === selectedEngagement)?.label;
    } else return null;
  }, [selectedEngagement, engagementList]);

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
  organizationList,
  getOrganizations,
}: {
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
  getOrganizations: () => Promise<any>;
  organizationList: TOrganization[];
}) {
  const { qas, qaLoading, quizLoading, quizzes, forms, formLoading } =
    useGetUserEngagements();
  const { getEvents, events } = useGetOrganizationEvents();
  const [isOpen, setOpen] = useState(false);
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
  const connectToEvent = useWatch({
    control: form.control,
    name: "formSettings.connectToEvent",
  });

  const eventAlias = useWatch({
    control: form.control,
    name: "formSettings.eventAlias",
  });
  function onClose() {
    setOpen((prev) => !prev);
  }

  const formattedList = useMemo(() => {
    const restructuredList = organizationList?.map(
      ({ id, organizationName }) => {
        return { value: id.toString(), label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  const workAlias = form.watch("wAlias");

  useEffect(() => {
    (async () => {
      if (workAlias) {
        await getEvents(workAlias);
      }
    })();
  }, [workAlias]);

  console.log("fewfwe", workAlias)

  const formattedEvents = useMemo(() => {
    if (Array.isArray(events) && events?.length > 0) {
      return events?.map((e) => {
        return {
          value: e?.eventAlias,
          label: e?.eventTitle,
        };
      });
    } else return [];
  }, [events]);

  const prevEvents = useMemo(() => {
    if (events?.length > 0 && eventAlias) {
      const singEvent = events?.find((e) => e.eventAlias === eventAlias);
      return {
        value: singEvent?.eventAlias,
        label: singEvent?.eventTitle,
      };
    } else return "";
  }, [events, eventAlias]);

  return (
    <>
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
        {/* 
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
      )} */}

        <div className="w-full flex flex-col mt-6 items-center gap-6">
          <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <p>Connect Form to an Event</p>
              <p className="text-tiny text-gray-500">
                Participants must provide their email to confirm event
                registration before being allowed to participate. Form points
                will be added to their Zikoro event participant points.
              </p>
            </div>
            <Switch
              checked={connectToEvent}
              onCheckedChange={(checked) => {
                form.setValue("formSettings.connectToEvent", checked);
              }}
              className=""
            />
          </div>

          {connectToEvent && (
            <>
              {" "}
              <div className="w-full mx-auto max-w-lg flex items-end gap-x-2">
                <FormField
                  control={form.control}
                  name="wAlias"
                  render={({ field }) => (
                    <InputOffsetLabel label="">
                      <ReactSelect
                        {...field}
                        placeHolder="Select a Workspace"
                        options={formattedList}
                      />
                    </InputOffsetLabel>
                  )}
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClose();
                  }}
                  className="hover:bg-basePrimary text-basePrimary  rounded-md border border-basePrimary hover:text-gray-50 gap-x-2 h-11 font-medium"
                >
                  <PlusCircle size={20} />
                  <p className="text-sm">Workspace</p>
                </Button>
              </div>
              <div className="w-full mx-auto max-w-lg flex items-end gap-x-2">
                <FormField
                  control={form.control}
                  name="formSettings.eventAlias"
                  render={({ field }) => (
                    <InputOffsetLabel label="">
                      <ReactSelect
                        defaultValue={prevEvents}
                        {...field}
                        placeHolder="Select an Event"
                        options={formattedEvents}
                        key={prevEvents?.toString()}
                      />
                    </InputOffsetLabel>
                  )}
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open("https://zikoro.com/create");
                  }}
                  className="hover:bg-basePrimary text-basePrimary  rounded-md border border-basePrimary hover:text-gray-50 gap-x-2 h-11 font-medium"
                >
                  <PlusCircle size={20} />
                  <p className="text-sm">Event</p>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}

//
