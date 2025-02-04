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
      ({ organizationAlias, organizationName }) => {
        return { value: organizationAlias, label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  async function onSubmit() {
    setLoading(true);
    await postData({
      payload: {
        ...quiz,
        accessibility: {
          ...accessibility,
          isCollectEmail: accessibility.visible ? true : false,
        },
      },
    });
    setLoading(false);
    refetch();
  }
  function onClose() {
    setOpen((prev) => !prev);
  }

  return (
    <>
      <div className="w-full">
        <Form {...form}>
          <form className="w-full flex flex-col items-center gap-4">
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

            <div className="w-full mx-auto max-w-lg flex items-end gap-x-2">
              <FormField
                control={form.control}
                name="workspaceAlias"
                render={({ field }) => (
                  <InputOffsetLabel label="Organization">
                    <ReactSelect
                      // defaultValue={prevOrg}
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
