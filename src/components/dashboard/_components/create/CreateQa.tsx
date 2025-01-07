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
import { eventQaSettingSchema } from "@/schemas/qa";
import { useMemo, useState } from "react";
import { useGetUserOrganizations } from "@/hooks/services/engagement";
import { PlusCircle } from "styled-icons/bootstrap";
import { CreateOrganization } from "@/components/createOrganization/CreateOrganization";
import { usePostRequest } from "@/hooks/services/requests";
import { LoaderAlt } from "styled-icons/boxicons-regular";
export function CreateQa() {
  const [isOpen, setOpen] = useState(false);
  const { organizations: organizationList, getOrganizations } =
    useGetUserOrganizations();
  const { postData, isLoading } = usePostRequest("engagements/qa");
  const form = useForm<z.infer<typeof eventQaSettingSchema>>({
    resolver: zodResolver(eventQaSettingSchema),
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

  async function onSubmit(values: z.infer<typeof eventQaSettingSchema>) {
    await postData({ payload: values });
  }
  return (
    <>
      <Form {...form}>
        <form className="flex flex-col items-center gap-4 w-full">
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
              name="organisationAlias"
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
                // onClose();
              }}
              className="hover:bg-basePrimary  text-basePrimary  rounded-md border border-basePrimary hover:text-gray-50 gap-x-2 h-[3.2rem]  font-medium"
            >
              <PlusCircle size={22} />
              <p>Workspace</p>
            </Button>
          </div>

          <Button
            disabled={isLoading}
            className="text-white gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
          >
            <LoaderAlt size={20} />
            <p> Proceed</p>
          </Button>
        </form>
      </Form>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
