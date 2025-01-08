"use client";

import InputOffsetLabel from "@/components/InputOffsetLabel";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QAIcon } from "@/constants";
import { Button, ReactSelect } from "@/components/custom";
import { UploadImage } from "../UploadImage";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import _ from "lodash";
import { eventQaCreationSchema } from "@/schemas/qa";
import { useMemo, useState } from "react";
import { useGetUserOrganizations } from "@/hooks/services/engagement";
import { PlusCircle } from "styled-icons/bootstrap";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { usePostRequest } from "@/hooks/services/requests";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import useUserStore from "@/store/globalUserStore";
import { TQa } from "@/types/qa";
import { generateAlias, generateInteractionAlias, uploadFile } from "@/utils";
export function CreateQa() {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const { organizations: organizationList, getOrganizations } =
    useGetUserOrganizations();
  const { postData, isLoading } =
    usePostRequest<Partial<TQa>>("engagements/qa");
  const form = useForm<z.infer<typeof eventQaCreationSchema>>({
    resolver: zodResolver(eventQaCreationSchema),
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

  async function onSubmit(values: z.infer<typeof eventQaCreationSchema>) {
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
      payload: {
        ...values,
        createdBy: user?.id,
        coverImage: image as string,
        QandAAlias: alias,
        lastUpdated_at: new Date().toISOString(),
      },
    });
    setLoading(false);

    window.open(`/e/${values?.workspaceAlis}/qa/o/${alias}`, "_self");
  }
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col text-sm items-center gap-4 w-full"
        >
          <div className="flex items-center flex-col justify-center mb-4 gap-y-2">
            <QAIcon />
            <p className="font-semibold">Create Q&A</p>
          </div>

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
              name="workspaceAlis"
              render={({ field }) => (
                <InputOffsetLabel label="Organization">
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

          <Button
            disabled={loading}
            className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
          >
            {loading && <LoaderAlt size={20} className="animate-spin" />}
            <p> Create</p>
          </Button>
        </form>
      </Form>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
