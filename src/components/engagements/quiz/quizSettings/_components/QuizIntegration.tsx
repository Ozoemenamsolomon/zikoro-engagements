"use client";

import { TQuiz, TQuestion } from "@/types/quiz";
import { TOrganization } from "@/types/home";
import { useState, useEffect, useMemo } from "react";
import { usePostRequest } from "@/hooks/services/requests";
import { Switch } from "@/components/ui/switch";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { Button, ReactSelect } from "@/components/custom";
import _ from "lodash";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { PlusCircle } from "styled-icons/bootstrap";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { useGetOrganizationEvents } from "@/hooks/services/engagement";
import { toast } from "react-toastify";
export function QuizIntegration({
  quiz,
  refetch,
  organization,
  organizationList,
  getOrganizations,
  orgloading,
}: {
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
  organization: TOrganization;
  getOrganizations: () => Promise<any>;
  organizationList: TOrganization[];
  orgloading: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const { postData, isLoading } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [accessibility, setAccessibility] = useState(quiz?.accessibility);
  const { getEvents, events } = useGetOrganizationEvents();
  const [isOpen, setOpen] = useState(false);
  const form = useForm({});
  useEffect(() => {
    if (quiz && quiz?.accessibility !== null) {
      setAccessibility(quiz?.accessibility);
    }
  }, [quiz]);
  const isQuiz = useMemo(() => {
    return quiz.interactionType === "quiz";
  }, [quiz]);
  const formattedList = useMemo(() => {
    const restructuredList = organizationList?.map(
      ({ id, organizationName }) => {
        return { value: id.toString(), label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  const workAlias = form.watch("workspaceAlias");
  const eventAlias = form.watch("eventAlias");
  useEffect(() => {
    (async () => {
      if (workAlias) {
        await getEvents(workAlias);
      }
    })();
  }, [workAlias]);

  async function onSubmit(values: any) {
    if (!values?.eventAlias) return toast.error("You did not add an event")
    setLoading(true);
    await postData({
      payload: {
        ...quiz,
        accessibility: {
          ...accessibility,
          isCollectEmail: accessibility.visible ? true : false,
          eventAlias: values?.eventAlias ?? ""
        },
      },
    });
    setLoading(false);
    refetch();
  }
  function onClose() {
    setOpen((prev) => !prev);
  }

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
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col items-center gap-6"
          >
            <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <p>Connect {isQuiz ? " Quiz " : " Poll "} to an Event</p>
                <p className="text-tiny text-gray-500">
                  Participants must provide their email to confirm event
                  registration before being allowed to participate.{" "}
                  {isQuiz ? "Quiz" : "Poll"} points will be added to their
                  Zikoro event participant points.
                </p>
              </div>
              <Switch
                disabled={loading}
                checked={accessibility?.visible}
                onClick={() =>
                  setAccessibility({
                    ...accessibility,
                    visible: !accessibility.visible,
                  })
                }
                className=""
              />
            </div>

          {accessibility?.visible && <>  <div className="w-full mx-auto max-w-lg flex items-end gap-x-2">
              <FormField
                control={form.control}
                name="workspaceAlias"
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
                name="eventAlias"
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
            </>}

            <Button
              onClick={onSubmit}
              disabled={loading}
              className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
            >
              {loading && <LoaderAlt size={20} className="animate-spin" />}
              <p>Update</p>
            </Button>
          </form>
        </Form>
      </div>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
