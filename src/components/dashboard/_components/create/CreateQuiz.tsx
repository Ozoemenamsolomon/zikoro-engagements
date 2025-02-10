"use client";

import InputOffsetLabel from "@/components/InputOffsetLabel";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuizIcon } from "@/constants";
import { Button, ReactSelect } from "@/components/custom";
import { UploadImage } from "../UploadImage";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import { quizCreationSchema } from "@/schemas/quiz";
import { useEffect, useMemo, useState } from "react";
import { useGetUserOrganizations } from "@/hooks/services/engagement";
import { PlusCircle } from "styled-icons/bootstrap";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { usePostRequest } from "@/hooks/services/requests";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import useUserStore from "@/store/globalUserStore";
import { generateInteractionAlias, uploadFile } from "@/utils";
import { TQuestion, TQuiz } from "@/types/quiz";
import { TOrganization } from "@/types/home";

export function CreateQuiz({
  quiz,
  refetch,
  organization,
  
}: {
  quiz?: TQuiz<TQuestion[]>;
  refetch?: () => Promise<any>;
  organization?: TOrganization;
}) {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  const {
    organizations: organizationList,
    getOrganizations,
    loading: isLoading,
  } = useGetUserOrganizations();
  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const form = useForm<z.infer<typeof quizCreationSchema>>({
    resolver: zodResolver(quizCreationSchema),
  });

  const coverImg = form.watch("coverImage");
  const addedImage = useMemo(() => {
    if (typeof coverImg === "string") {
      return coverImg;
    } else if (coverImg && coverImg[0]) {
      return URL.createObjectURL(coverImg[0]);
    } else {
      return null;
    }
  }, [coverImg]);

  const formattedList = useMemo(() => {
    const restructuredList = organizationList?.map(
      ({ organizationAlias, organizationName }) => {
        return { value: organizationAlias, label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  function onClose() {
    setOpen((prev) => !prev);
  }

  const alias = useMemo(() => {
    return generateInteractionAlias();
  }, []);

  async function onSubmit(values: z.infer<typeof quizCreationSchema>) {
    setLoading(true);
    const image = await new Promise(async (resolve) => {
      if (typeof values?.coverImage === "string") {
        resolve(values?.coverImage);
      } else if (values?.coverImage && values?.coverImage[0]) {
        const img = await uploadFile(values?.coverImage[0], "image");
        resolve(img);
      } else {
        resolve(null);
      }
    });

    const payload: Partial<TQuiz<TQuestion[]>> = quiz
      ? {
          ...quiz,
          ...values,
          coverImage: image as string,
          lastUpdated_at: new Date().toISOString(),
        }
      : {
          ...values,
          createdBy: user?.id,
          coverImage: image as string,
          quizAlias: alias,
          interactionType: "quiz",
          lastUpdated_at: new Date().toISOString(),
          accessibility: {
            visible: false,
            review: false,
            countdown: true,
            timer: true,
            countdownTransition: true,
            countDown: 5,
            disable: false,
            playMusic: false,
            musicList: null,
            music: null,
            live: false,
            isCollectPhone: false,
            isCollectEmail: false,
            isForm: false,
            showAnswer: true,
            showResult: true,
            eventAlias: ""
          },
          branding: {
            eventName: true,
            poweredBy: true,
          },
        };
    await postData({
      payload,
    });
    setLoading(false);
    refetch?.();
    if (!quiz) {
      window.open(
        `/e/${values?.workspaceAlias}/quiz/o/${alias}/add-question`,
        "_self"
      );
    }
  }

  useEffect(() => {
    if (quiz) {
      form.reset({
        coverImage: quiz?.coverImage,
        coverTitle: quiz?.coverTitle,
        description: quiz?.description,
        workspaceAlias: quiz?.workspaceAlias,
      });
    }
  }, [quiz]);

  const prevOrg = useMemo(() => {
    if (organization) {
      return {
        value: organization?.organizationAlias,
        label: organization?.organizationName,
      };
    } else return "";
  }, [organization]);

  // if (isLoading) return <LoadingState/>
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col text-sm items-center gap-4 w-full"
        >
          {!quiz && (
            <div className="flex items-center flex-col justify-center mb-4 gap-y-2">
              <QuizIcon />
              <p className="font-semibold">Create Quiz</p>
            </div>
          )}

          <UploadImage image={addedImage} name="coverImage" form={form} />
          <FormField
            control={form.control}
            name="coverTitle"
            render={({ field }) => (
              <InputOffsetLabel label="QA Title">
                <Input
                  placeholder="Enter title"
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
              <InputOffsetLabel label="QA Description">
                <Input
                  placeholder="Enter description"
                  type="text"
                  {...form.register("description")}
                  className="placeholder:text-sm h-11 text-gray-700"
                />
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
            disabled={loading}
            className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
          >
            {loading && <LoaderAlt size={20} className="animate-spin" />}
            <p> {quiz ? "Update" : "Create"}</p>
          </Button>
        </form>
      </Form>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
