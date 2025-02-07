"use client";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, ReactSelect } from "@/components/custom";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Switch } from "@/components/ui/switch";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { CloseOutline } from "styled-icons/evaicons-outline";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { eventQaSettingSchema } from "@/schemas/qa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useEffect, useState } from "react";
import { TQa } from "@/types/qa";
import Image from "next/image";
import { generateInteractionAlias, uploadFile } from "@/utils";
import { PlusCircle } from "styled-icons/bootstrap";
import { useGetData, usePostRequest } from "@/hooks/services/requests";
import { cn } from "@/lib/utils";
import { AddQaTag } from "./AddQaTag";
import { TOrganization } from "@/types/home";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { UploadImage } from "@/components/dashboard/_components/UploadImage";
import { useGetOrganizationEvents, useGetUserOrganizations } from "@/hooks/services/engagement";
import _ from "lodash";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";

type QaSettingProp = {
  workspaceAlias: string;
  close: () => void;
  qa?: TQa | null;
  refetch?: (t?: boolean) => Promise<any>;
};

export enum QaSettingType {
  details,
  accessibility,
  branding,
  integration,
}

export function QaSetting({
  close,
  workspaceAlias,
  qa,
  refetch,
}: QaSettingProp) {
  const { postData } = usePostRequest<Partial<TQa>>("/engagements/qa");
  const {
    organizations: organizationList,
    getOrganizations,
    loading: isLoading,
  } = useGetUserOrganizations();
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(1);
  const [activeType, setActiveType] = useState(QaSettingType.details);

  const [branding, setBranding] = useState({
    eventName: true,
    poweredBy: true,
  });
  const [loading, setLoading] = useState(false);
  const [accessibility, setAccessibility] = useState({
    visible: false,
    disable: false,
    live: false,
    allowAnonymous: false,
    mustReviewQuestion: true,
    cannotAskQuestion: false,
    canRespond: true,
    canPin: false,
    indicateAnsweredQuestions: false,
    canTag: false,
    eventAlias :"",
    canCollectEmail: false,
    connectEvent: false

  });
  const form = useForm<z.infer<typeof eventQaSettingSchema>>({
    resolver: zodResolver(eventQaSettingSchema),
  });
  const { getEvents, events } = useGetOrganizationEvents();
  const coverImg = form.watch("coverImage");

  const qaAlias = useMemo(() => {
    return generateInteractionAlias();
  }, []);

  async function onSubmit(values: z.infer<typeof eventQaSettingSchema>) {
    setLoading(true);
    const image = new Promise(async (resolve) => {
      if (typeof values?.coverImage === "string") {
        resolve(values?.coverImage);
      } else if (values?.coverImage && values?.coverImage[0]) {
        const img = await uploadFile(values?.coverImage[0], "image");
        resolve(img);
      } else {
        resolve(null);
      }
    });

    const promise: any = await image;
    const payload: Partial<TQa> = qa?.QandAAlias
      ? {
          ...qa,
          ...values,
          coverImage: promise,
          branding,
          accessibility,
          workspaceAlias: workspaceAlias,
          lastUpdated_at: new Date().toISOString(),
        }
      : {
          ...values,
          QandAAlias: qaAlias,
          workspaceAlias: workspaceAlias,
          coverImage: promise,
          branding,
          accessibility,
          lastUpdated_at: new Date().toISOString(),
        };

    await postData({ payload });
    if (refetch) refetch();
    setLoading(false);
    window.open(
      `/e/${workspaceAlias}/qa/o/${qa?.QandAAlias || qaAlias}`,
      "_self"
    );
    close();
  }

  const addedImage = useMemo(() => {
    if (typeof coverImg === "string") {
      return coverImg;
    } else if (coverImg && coverImg[0]) {
      return URL.createObjectURL(coverImg[0]);
    } else {
      return null;
    }
  }, [coverImg]);

  useEffect(() => {
    if (qa) {
      form.reset({
        coverImage: qa?.coverImage,
        coverTitle: qa?.coverTitle,
        description: qa?.description,
        workspaceAlias: qa?.workspaceAlias,
      });

      if (qa?.branding) {
        setBranding(qa?.branding);
      }
      if (qa?.accessibility) {
        setAccessibility(qa?.accessibility);
      }
    }
  }, [qa]);

  const prevOrg = useMemo(() => {
    if (organization) {
      return {
        value: organization?.organizationAlias,
        label: organization?.organizationName,
      };
    } else return "";
  }, [organization]);

  const formattedList = useMemo(() => {
    const restructuredList = organizationList?.map(
      ({ organizationAlias, organizationName }) => {
        return { value: organizationAlias, label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  function onClose() {
    setIsOpen((prev) => !prev);
  }

  const workAlias = form.watch("prevworkspaceAlias");
  const eventAlias = form.watch("eventAlias");
  useEffect(() => {
    (async () => {
      if (workAlias) {
        await getEvents(workAlias);
      }
    })();
  }, [workAlias]);

  const prevEvents = useMemo(() => {
    if (events?.length > 0 && eventAlias) {
      const singEvent = events?.find((e) => e.eventAlias === eventAlias);
      return {
        value: singEvent?.eventAlias,
        label: singEvent?.eventTitle,
      };
    } else return "";
  }, [events, eventAlias]);

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
  return (
    <div
      onClick={close}
      role="button"
      className="w-screen h-screen fixed inset-0 bg-white/50 z-[200]"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          "right-0 min-h-screen animate-float-in border vert-scroll inset-y-0 absolute max-w-3xl w-full bg-white overflow-y-auto",
          active === 2 && "hidden"
        )}
      >
        <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
          <div className="w-full flex items-center justify-between">
            <h2>QA Settings</h2>
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
            {["Details", "Accessibility", "Branding", "Integration"].map(
              (v, index) => (
                <button
                key={index}
                  onClick={() => setActiveType(index)}
                  className={cn(
                    "px-6 py-3 border-b-2",
                    activeType === index &&
                      "text-basePrimary border-basePrimary"
                  )}
                >
                  {v}
                </button>
              )
            )}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex items-center justify-start flex-col gap-y-3"
            >
              {QaSettingType.details === activeType && (
                <>
                  <UploadImage
                    image={addedImage}
                    name="coverImage"
                    form={form}
                  />
                  <FormField
                    control={form.control}
                    name="coverTitle"
                    render={({ field }) => (
                      <InputOffsetLabel label="Cover Title">
                        <Input
                          placeholder="Cover Title"
                          type="text"
                          {...form.register("coverTitle")}
                          className="placeholder:text-sm h-11 text-gray-700"
                        />
                      </InputOffsetLabel>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <InputOffsetLabel label="Description">
                        <Textarea
                          placeholder="Enter the description"
                          {...form.register("description")}
                          className="placeholder:text-sm   placeholder:text-gray-400 text-gray-700"
                        ></Textarea>
                      </InputOffsetLabel>
                    )}
                  />

                  <div className="w-full flex items-end gap-x-2">
                    <FormField
                      control={form.control}
                      name="workspaceAlias"
                      render={({ field }) => (
                        <InputOffsetLabel label="Organization">
                          <ReactSelect
                            defaultValue={prevOrg}
                            {...field}
                            placeHolder="Select a Workspace"
                            options={formattedList}
                            key={prevOrg.toString()}
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
                </>
              )}

              {QaSettingType.branding === activeType && (
                <>
                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <p>Show QA Name</p>
                    <Switch
                      disabled={loading}
                      checked={branding?.eventName}
                      onClick={() =>
                        setBranding({
                          ...branding,
                          eventName: !branding?.eventName,
                        })
                      }
                      className=""
                    />
                  </div>
                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <p>Show Create your own Q&A</p>
                    <Switch
                      checked={branding?.poweredBy}
                      disabled={loading}
                      onClick={() =>
                        setBranding({
                          ...branding,
                          poweredBy: !branding?.poweredBy,
                        })
                      }
                      className=""
                    />
                  </div>
                </>
              )}

              {QaSettingType.accessibility === activeType && (
                <>
                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Live Mode</p>
                      <p className="text-xs text-gray-500">
                        Questions from your audience are visible to you in
                        realtime
                        {/* {organization && organization?.subscriptionPlan.toLowerCase() === "free"
                    ? `Upgrade to higher subscription to use this feature.`
                    : `All  attendees will attempt at the same time.`} */}
                      </p>
                    </div>
                    <Switch
                      title="Upgrade to higher subscription to use this feature."
                      disabled={loading}
                      checked={accessibility?.live}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          live: !accessibility.live,
                        })
                      }
                      className=""
                    />
                  </div>

                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Anonymized Entries </p>
                      <p className="text-xs text-gray-500">
                        Participants can ask and respond to questions as
                        anonymous when turned on.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.allowAnonymous}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          allowAnonymous: !accessibility.allowAnonymous,
                        })
                      }
                      className=""
                    />
                  </div>
                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p> Moderation </p>
                      <p className="text-xs text-gray-500">
                        Review questions before they are visible to all
                        participants.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.mustReviewQuestion}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          mustReviewQuestion: !accessibility.mustReviewQuestion,
                        })
                      }
                      className=""
                    />
                  </div>
                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p> Close question </p>
                      <p className="text-xs text-gray-500">
                        Restrict participants from asking new questions.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.cannotAskQuestion}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          cannotAskQuestion: !accessibility.cannotAskQuestion,
                        })
                      }
                      className=""
                    />
                  </div>

                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Replies</p>
                      <p className="text-xs text-gray-500">
                        Participants can respond to any question.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.canRespond}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          canRespond: !accessibility.canRespond,
                        })
                      }
                      className=""
                    />
                  </div>

                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Answered questions</p>
                      <p className="text-xs text-gray-500">
                        Highlight answered questions and make it visible to
                        everyone.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.indicateAnsweredQuestions}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          indicateAnsweredQuestions:
                            !accessibility.indicateAnsweredQuestions,
                        })
                      }
                      className=""
                    />
                  </div>

                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Pin a Question</p>
                      <p className="text-xs text-gray-500">
                        Admin can pin question to make them appear at the top of
                        the list.
                      </p>
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.canPin}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          canPin: !accessibility.canPin,
                        })
                      }
                      className=""
                    />
                  </div>

                  <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                    <div className="flex flex-col items-start justify-start">
                      <p>Tag</p>
                      <p className="text-xs text-gray-500">
                        Admin can add tag to a question.
                      </p>
                      {accessibility?.canTag && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActive(2);
                          }}
                          className="text-basePrimary font-medium flex items-center gap-x-2"
                        >
                          <PlusCircle size={20} />
                          Add Tag
                        </button>
                      )}
                    </div>
                    <Switch
                      disabled={loading}
                      checked={accessibility?.canTag}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          canTag: !accessibility.canTag,
                        })
                      }
                      className=""
                    />
                  </div>
                </>
              )}

              {QaSettingType.integration === activeType && <>
              
                <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <p>Connect to an Event</p>
                <p className="text-tiny text-gray-500">
                  Participants must provide their email to confirm event
                  registration before being allowed to participate.
                </p>
              </div>
              <Switch
                disabled={loading}
                checked={accessibility?.connectEvent}
                onClick={() =>
                  setAccessibility({
                    ...accessibility,
                    connectEvent: !accessibility.connectEvent,
                  })
                }
                className=""
              />
            </div>

          {accessibility?.connectEvent &&  <><div className="w-full mx-auto max-w-lg flex items-end gap-x-2">
              <FormField
                control={form.control}
                name="prevworkspaceAlias"
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
          </>
            }
              
              </>}

              <Button
                disabled={loading}
                type="submit"
                className="w-full gap-x-2 mt-3 max-w-xl mx-auto text-gray-50 bg-basePrimary hover:bg-basePrimary/80 "
              >
                {loading && <LoaderAlt size={22} className="animate-spin" />}
                <p>Submit</p>
              </Button>
            </form>
          </Form>
        </div>
      </div>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
      {active === 2 && (
        <AddQaTag
          qa={qa}
          refetch={refetch}
          tags={qa?.tags}
          close={close}
          setActive={setActive}
        />
      )}
    </div>
  );
}
