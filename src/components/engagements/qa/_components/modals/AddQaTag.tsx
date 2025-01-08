"use client";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { ArrowBackOutline } from "@styled-icons/evaicons-outline/ArrowBackOutline";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import React, { useState } from "react";
import { ViewTag } from "@/components/composables/ViewTag";
import { TQaTag, TQa } from "@/types/qa";
import { usePostRequest } from "@/hooks/services/requests";
import toast from 'react-hot-toast';
type FormValue = {
  name: string;
};

export function AddQaTag({
  setActive,
  close,
  tags,
  qa,
  refetch,
}: {
  close: () => void;
  setActive: React.Dispatch<React.SetStateAction<number>>;
  tags?: TQaTag[] | null;
  refetch?: (t?:boolean) => Promise<any>;
  qa?: TQa | null;
}) {
  const form = useForm<FormValue>();
  const [tagColor, setTagColor] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);
  const { postData, isLoading } =
    usePostRequest<Partial<TQa>>("/engagements/qa");

  async function onSubmit(value: FormValue) {
    if (tagColor === "" || value.name === undefined) {
      toast.error("Pls, Select a Color or Name");
      return;
    }
    const payload =
      Array.isArray(tags) && tags.length > 0
        ? [...tags, { name: value?.name, color: tagColor }]
        : [{ name: value?.name, color: tagColor }];
        setloading(true)

    if (qa) {
      await postData({ payload: { ...qa, tags: payload } });
    }
    if (refetch) refetch(true);
    setloading(false)
    /**F
     await createEventIndustry(data, eventId, {
      name: value.name,
      color: tagColor,
    });

    form.reset({
      name: "",
    });
    setTagColor("");
    refetch();
   */

    /**
     setCreatedTracks((prev) => [
      ...prev,
      { name: value.name, color: tagColor },
    ]);
    */
  }

  // FN to remove from the list of tracks

  async function remove(id: number) {
    const updatedList = tags?.filter((_, index) => index !== id);

    if (qa) {
      await postData({ payload: { ...qa, tags: updatedList } });
    }
    if (refetch) refetch(true);
  }

  return (
    <div
      role="button"
      onClick={close}
      className="w-full h-full fixed z-[320] inset-0 bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="button"
        className="w-[95%] sm:w-[500px] box-animation h-fit flex flex-col gap-y-6 rounded-lg bg-white m-auto absolute inset-0 py-8 px-3 sm:px-6"
      >
        <div className="w-full flex items-center gap-x-2">
          <Button onClick={() => setActive(1)} className="px-1 h-fit w-fit">
            <ArrowBackOutline size={22} />
          </Button>
          <h2 className="font-medium text-lg sm:text-xl">Create New Tag</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start w-full flex-col gap-y-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <InputOffsetLabel label="Tag">
                  <Input
                    type="text"
                    placeholder="tag"
                    {...field}
                    className=" placeholder:text-sm focus:border-gray-500 placeholder:text-gray-300 text-gray-700"
                  />
                </InputOffsetLabel>
              )}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-full my-8 h-fit"
            >
              <CirclePicker
                width="100%"
                color={tagColor}
                onChangeComplete={(color) => setTagColor(color.hex)}
                circleSize={36}
              />
            </div>
            {Array.isArray(tags) && tags?.length > 0 && (
              <div className="w-full flex flex-col gap-y-4 items-start justify-start">
                <h3>Your Created Tags</h3>

                <div className="w-full flex flex-wrap items-center gap-4">
                  {Array.isArray(tags) &&
                    tags.map(({ name, color }, index) => (
                      <ViewTag
                        key={name}
                        name={name}
                        remove={() => remove(index)}
                        color={color}
                      />
                    ))}
                </div>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="mt-4  w-full gap-x-2 bg-basePrimary text-gray-50 font-medium"
            >
              {loading && <LoaderAlt size={22} className="animate-spin" />}
              <span>Create Tag</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
