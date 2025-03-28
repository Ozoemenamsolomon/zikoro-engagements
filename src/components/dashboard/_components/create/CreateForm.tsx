"use client";

import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formCreationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import _ from "lodash";
import useUserStore from "@/store/globalUserStore";
import { z } from "zod";
import { usePostRequest } from "@/hooks/services/requests";
import { useGetUserOrganizations } from "@/hooks/services/engagement";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { Button, ReactSelect } from "@/components/custom";
import { PlusCircle } from "styled-icons/bootstrap";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { UploadImage } from "../UploadImage";
import { FormIcon } from "@/constants";
import { generateInteractionAlias } from "@/utils";
import { uploadFile } from "@/utils";
import { TEngagementFormQuestion } from "@/types/form";
import { TOrganization } from "@/types/home";
import { useSearchParams } from "next/navigation";

export function CreateForm({
  engagementForm,
  refetch,
  organization,
}: {
  engagementForm?: TEngagementFormQuestion;
  organization?: TOrganization;
  refetch?: () => Promise<any>;
}) {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const params = useSearchParams();
  const eventId = params.get("eventId");
  const platform = params.get("platform");
  const { organizations: organizationList, getOrganizations } =
    useGetUserOrganizations();
  const { postData, isLoading } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const form = useForm<z.infer<typeof formCreationSchema>>({
    resolver: zodResolver(formCreationSchema),
    defaultValues: engagementForm
      ? { formSettings: engagementForm?.formSettings }
      : {
          formSettings: {
            isConnectedToEngagement: false,
            showForm: "beforeEngagement",
            redirectUrl: "",
            isCoverScreen: true,
            displayType: "listing",
            questionPerSlides: "1",
            titleFontSize: "36",
            headingFontSize: "24",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            buttonColor: "#001FFC",
            textFontSize: "14",
            isCoverImage: true,
            buttonText: "Submit",
            startButtonText: "Start",
            isCollectEmail: false,
            isCollectPhone: false,
            connectToEvent: platform === "Event" ? true : false,
            showResult: false,
            isRedirectUrl: false,
            engagementId: "",
            engagementType: "",
            hideNumber: false,
            hideLabel: false,
            labellingType: "Number",
            backgroundBrightness: 100,
            preMadeType:"",
            isBackgroundImage: false,
            isBackgroundColor: false,
            eventAlias: eventId ?? "",
            endScreenSettings: {
              title: "Thanks for completing the form",
              subText: "This is all for now",
              buttonText: "Create Form",
              buttonUrl: "",
              x: "",
              linkedIn: "",
              instagram: "",
              facebook: "",
              website: "",
              showButton: true,
              socialLink: true,
            }
          },
        },
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

  async function onSubmit(values: z.infer<typeof formCreationSchema>) {
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
    await postData({
      payload: engagementForm
        ? {
            ...engagementForm,
            ...values,
            coverImage: image as string,
          }
        : {
            ...values,
            createdBy: user?.id,
            coverImage: image as string,
            formAlias: alias,
          },
    });
    setLoading(false);

    window.open(
      `/e/${values?.workspaceAlias}/form/o/${alias}/add-question`,
      "_self"
    );
  }

  useEffect(() => {
    if (engagementForm) {
      form.reset({
        coverImage: engagementForm?.coverImage,
        title: engagementForm?.title,
        description: engagementForm?.description,
        workspaceAlias: engagementForm?.workspaceAlias,
        formSettings: engagementForm?.formSettings,
      });
    }
  }, [engagementForm]);

  const prevOrg = useMemo(() => {
    if (organization) {
      return {
        value: organization?.organizationAlias,
        label: organization?.organizationName,
      };
    } else return "";
  }, [organization]);

  const prevStartButtonText = useWatch({
    control: form.control,
    name: "formSettings.startButtonText",
  });

  console.log("form creation update", form.formState.errors);
  console.log("form values", form.getValues());
  console.log("init", engagementForm?.formSettings);
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col text-sm items-center gap-4 w-full"
        >
          {!engagementForm && (
            <div className="flex items-center flex-col justify-center mb-4 gap-y-2">
              <FormIcon />
              <p className="font-semibold">Create Form</p>
            </div>
          )}

          <UploadImage image={addedImage} name="coverImage" form={form} />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <InputOffsetLabel label="Form Title">
                <Input
                  placeholder="Enter title"
                  type="text"
                  {...form.register("title")}
                  className="placeholder:text-sm h-11 text-gray-700"
                />
              </InputOffsetLabel>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <InputOffsetLabel label="Form Description">
                <Input
                  placeholder="Enter description"
                  type="text"
                  {...form.register("description")}
                  className="placeholder:text-sm h-11 text-gray-700"
                />
              </InputOffsetLabel>
            )}
          />
          {engagementForm && (
            <div className="w-full">
              <FormField
                control={form.control}
                name="formSettings.startButtonText"
                render={({ field }) => (
                  <InputOffsetLabel
                    className="w-full"
                    label="Start Button Text"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      defaultValue={prevStartButtonText}
                      {...form.register("formSettings.startButtonText")}
                      className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
            </div>
          )}

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
            <p> {engagementForm ? "Update" : "Create"}</p>
          </Button>
        </form>
      </Form>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
