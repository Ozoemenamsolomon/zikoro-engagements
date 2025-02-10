"use client";

import Image from "next/image";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import { useFieldArray, useForm } from "react-hook-form";
import { useGetData, usePostRequest } from "@/hooks/services/requests";
import { TEngagementFormAnswer, TEngagementFormQuestion } from "@/types/form";
import {
  CheckboxTypeAnswer,
  DateTypeAnswer,
  TextTypeAnswer,
  RatingTypeAnswer,
  MultiChoiceTypeAnswer,
  UploadTypeAnswer,
  ImageUploadTypeAnswer,
} from "./answerTypes";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { Suspense, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formAnswerSchema } from "@/schemas";
import { generateAlias } from "@/utils";
import useUserStore from "@/store/globalUserStore";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { InlineIcon } from "@iconify/react";
import { useVerifyAttendee } from "@/hooks/services/engagement";

function SubmittedModal() {
  return (
    <div className="w-full h-full inset-0 fixed bg-white">
      <div className="w-[95%] max-w-xl border rounded-lg bg-gradient-to-b gap-y-6 from-white  to-basePrimary/20  h-[400px] flex flex-col items-center justify-center shadow absolute inset-0 m-auto">
        <Image
          src="/facheck.png"
          alt=""
          className="w-fit h-fit"
          width={48}
          height={48}
        />
        <div className="w-fit flex flex-col items-center justify-center gap-y-2">
          <h2 className="font-semibold text-lg sm:text-2xl">Forms Submitted</h2>
          <p>Your answers have been submitted successfully</p>
        </div>
      </div>
    </div>
  );
}

function FillFormComp({
  workspaceAlias,

  formId,
}: {
  workspaceAlias: string;
  formId: string;
}) {
  const { user } = useUserStore();
  const router = useRouter();

  const params = useSearchParams();
  const attendeeId = params.get("id");
  const link = params.get("link");
  const query = params.get("redirect");
  const [isView, setIsView] = useState(true);
  const [currentIndexes, setCurrentIndexes] = useState(0);
  // const { isIdPresent } = useCheckTeamMember({ eventId });
  const [isSuccess, setOpenSuccess] = useState(false);
  const { data, isLoading } = useGetData<TEngagementFormQuestion>(
    `/engagements/form/${formId}`
  );
  const { data: formAnswers } = useGetData<TEngagementFormAnswer[]>(
    `/engagements/form/answer/${formId}`
  );
  const attendeeEmail = params.get("attendeeEmail");
  const {
    attendee,
    getAttendee,
    loading: attendeeLoading,
  } = useVerifyAttendee();

  const { postData, isLoading: loading } = usePostRequest<
    Partial<TEngagementFormAnswer>
  >(`/engagements/form/answer`);

  const form = useForm<z.infer<typeof formAnswerSchema>>({
    resolver: zodResolver(formAnswerSchema),
    defaultValues: {
      formResponseAlias: generateAlias(),
      formAlias: formId,
      questions: data?.questions,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  const [currentQuestions, setCurrentQuestion] = useState(fields);

  async function onSubmit(values: z.infer<typeof formAnswerSchema>) {
    //  console.log(values); formEngagementPoints

    const { questions, ...restData } = values;

    const responses = await Promise.all(
      restData?.responses?.map(async (item) => {
        if (
          item?.type === "ATTACHMENT" &&
          item?.response &&
          item?.response instanceof File
        ) {
          const file: File = item?.response;
          const data = await uploadFile(file);
          const response = {
            name: file?.name,
            id: nanoid(),
            fileData: data,
          };
          return {
            ...item,
            response,
          };
        }

        return item;
      })
    );
    const payload: Partial<TEngagementFormAnswer> = {
      ...restData,
      attendeeAlias: attendeeId || attendee?.attendeeAlias || generateAlias(),
      attendeeId: attendee?.id ? attendee?.id : null,
      attendeeEmail: attendee?.email || "",
      responses,
    };

    await postData({ payload });

    if (query) {
      router.push(
        `${link}?&redirect=form&id=${attendeeId}&responseAlias=${values?.formResponseAlias}`
      );
      return;
    }
    setOpenSuccess(true);

    if (
      data?.formSettings?.isConnectedToEngagement &&
      data?.formSettings?.redirectUrl
    ) {
      return window.open(data?.formSettings?.redirectUrl, "_self");
    }
  }

  useEffect(() => {
    (async () => {
      if (attendeeEmail) {
        await getAttendee(workspaceAlias, attendeeEmail);
      }
    })();
  }, [attendeeEmail]);

  useEffect(() => {
    if (data?.formSettings?.displayType === "slide") {
      const questionPerSlide = parseInt(
        data?.formSettings?.questionPerSlides || "1"
      );
      const slicedQuestion = fields.slice(
        currentIndexes,
        currentIndexes + questionPerSlide
      );
    //  console.log(currentIndexes, currentIndexes + questionPerSlide);
      setCurrentQuestion(slicedQuestion);
    } else {
      setCurrentQuestion(fields);
    }
  }, [data, fields, currentIndexes]);

  useEffect(() => {
    if (data) {
      form.setValue("questions", data?.questions);
    }
  }, [data]);

  // check if attendee has already fill the form
  const isResponseAlreadySubmitted = useMemo(() => {
    if (Array.isArray(formAnswers) && formAnswers?.length > 0) {
      return formAnswers?.some(
        (item) =>
          item?.attendeeAlias === (attendee?.attendeeAlias || attendeeId)
      );
    } else {
      return false;
    }
  }, [formAnswers, attendee, attendeeId]);

  console.log(isLoading, attendeeLoading);

  const rgba = useMemo(
    (alpha = 0.1) => {
      if (data) {
        const color = data?.formSettings?.buttonColor || "#001fcc";
        const r = parseInt(color.slice(1, 3), 12);
        const g = parseInt(color.slice(3, 5), 12);
        const b = parseInt(color.slice(5, 7), 12);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    },
    [data, data?.formSettings?.buttonColor]
  );

  console.log(currentQuestions)

  if (isLoading || attendeeLoading) {
    return (
      <div className="w-full h-[30rem] flex items-center justify-center">
        <LoaderAlt size={30} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!isLoading &&
        !attendeeLoading &&
        data?.formSettings?.isCollectEmail &&
        (typeof attendee !== "object" || attendeeId !== null) && (
          <div className="w-full h-full inset-0 fixed z-[100] bg-white">
            <div className="w-[95%] max-w-xl border rounded-lg bg-gradient-to-b gap-y-6 from-white  to-basePrimary/20  h-[400px] flex flex-col items-center justify-center shadow absolute inset-0 m-auto">
              <InlineIcon
                icon="fluent:emoji-sad-20-regular"
                fontSize={60}
                color="#001fcc"
              />
              <div className="w-fit flex flex-col items-center justify-center gap-y-3">
                <p>You are not a registered attendee for this event</p>

                <Button
                  onClick={() => {
                    window.open(
                      `https://zikoro.com/live-events/${attendee?.eventAlias}`
                    );
                  }}
                  className="bg-basePrimary h-12 text-white font-medium"
                >
                  Register for the event
                </Button>
              </div>
            </div>
          </div>
        )}
      {isView && !isLoading && data?.formSettings?.isCoverImage && (
        <div className="w-full min-h-screen bg-white justify-center inset-0 fixed z-[100] flex flex-col items-center gap-y-8">
          {data?.coverImage &&
          (data?.coverImage as string).startsWith("https") ? (
            <Image
              src={data?.coverImage}
              alt="cover-image"
              width={2000}
              height={1000}
              className="w-[15rem] h-[15rem] sm:h-[15rem] object-cover rounded-lg"
            />
          ) : (
            <div></div>
          )}
          <h2
            style={{
              fontSize: data?.formSettings?.titleFontSize + "px" || "30px",
              lineHeight:
                1.3 * parseInt(data?.formSettings?.titleFontSize) + "px" ||
                "40px",
            }}
            className="text-lg mb-3 sm:text-xl lg:text-2xl"
          >
            {data?.title ?? ""}
          </h2>
          <p
            className="innerhtml  "
            dangerouslySetInnerHTML={{
              __html: data?.description,
            }}
          />
          <Button
            onClick={() => setIsView(false)}
            style={{
              backgroundColor: data?.formSettings?.buttonColor || "",
            }}
            className={cn(
              "self-center w-fit gap-x-2  text-white font-medium h-11 ",
              !data?.formSettings?.buttonColor && "bg-basePrimary"
            )}
          >
            <p>{data?.formSettings?.startButtonText ?? "Start"}</p>
          </Button>
        </div>
      )}

      <div
        style={{
          fontSize: data?.formSettings?.textFontSize + "px" || "14px",
          backgroundColor: rgba,
          color: data?.formSettings?.textColor || "",
        }}
        className={cn("w-screen min-h-screen", isLoading && "hidden")}
      >
        <div
          style={{
            backgroundColor: data?.formSettings?.backgroundColor || "",
          }}
          className="w-full h-full overflow-y-auto vert-scroll absolute m-auto inset-0  rounded-lg p-4 sm:p-6"
        >
          <div className="w-full my-10 pb-20 sm:my-20 mx-auto max-w-3xl ">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col items-start mt-3 justify-start gap-y-4 sm:gap-y-6 2xl:gap-y-8"
              >
                {currentQuestions?.map((field, index) => {

                  return (
                    <div
                    className={cn("w-full", data?.formSettings?.displayType !== "slide" && "border p-4 sm:p-6 rounded-lg")}
                    key={`${field.id}`}
                  >
                    {field.selectedType === "INPUT_TEXT" && (
                      <TextTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        rgba={rgba || "#F7F8FF"}
                        bgColor={
                            data?.formSettings?.buttonColor || "#001fcc"
                          }
                      />
                    )}
                    {field.selectedType === "INPUT_DATE" && (
                      <DateTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        rgba={rgba || "#F7F8FF"}
                        bgColor={
                            data?.formSettings?.buttonColor || "#001fcc"
                          }
                      />
                    )}
                    {field.selectedType === "INPUT_CHECKBOX" && (
                      <CheckboxTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        bgColor={
                          data?.formSettings?.buttonColor || "#001fcc"
                        }
                        rgba={rgba || "#F7F8FF"}
                      />
                    )}
                    {field.selectedType === "INPUT_RATING" && (
                      <RatingTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        bgColor={
                          data?.formSettings?.buttonColor || "#001fcc"
                        }
                        rgba={rgba || "#F7F8FF"}
                      />
                    )}
                    {field.selectedType === "ATTACHMENT" && (
                      <UploadTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        bgColor={
                          data?.formSettings?.buttonColor || "#001fcc"
                        }
                        rgba={rgba || "#F7F8FF"}
                      />
                    )}
                    {field.selectedType === "INPUT_MULTIPLE_CHOICE" && (
                      <MultiChoiceTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        bgColor={
                          data?.formSettings?.buttonColor || "#001fcc"
                        }
                        rgba={rgba || "#F7F8FF"}
                      />
                    )}
                    {field.selectedType === "PICTURE_CHOICE" && (
                      <ImageUploadTypeAnswer
                        form={form}
                        index={index + currentIndexes}
                        bgColor={
                          data?.formSettings?.buttonColor || "#001fcc"
                        }
                        rgba={rgba || "#F7F8FF"}
                      />
                    )}
                  </div>
                  )
                })}

                {data?.formSettings?.displayType === "slide" && (
                  <div className="w-full flex items-center justify-between">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const questionPerSlide = parseInt(
                          data?.formSettings?.questionPerSlides || "1"
                        );

                        if (
                          currentIndexes >=
                          parseInt(data?.formSettings?.questionPerSlides || "1")
                        ) {
                          setCurrentIndexes((prev) =>
                            Math.max(0, prev - questionPerSlide)
                          );
                        }
                      }}
                      style={{
                        color: data?.formSettings?.buttonColor || "",
                        border: `1px solid ${
                          data?.formSettings?.buttonColor || "#001fcc"
                        }`,
                      }}
                      className="border h-12 font-medium"
                    >
                      Previous
                    </Button>
                    {currentIndexes +
                      parseInt(data?.formSettings?.questionPerSlides || "1") >=
                    fields?.length ? (
                      <Button
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor:
                            data?.formSettings?.buttonColor || "",
                        }}
                        className={cn(
                          "self-center w-fit gap-x-2  text-white font-medium h-12 ",
                          !data?.formSettings?.buttonColor && "bg-basePrimary"
                        )}
                      >
                        {loading && (
                          <LoaderAlt className="animate-spin" size={20} />
                        )}
                        <p>{data?.formSettings?.buttonText || "Submit"}</p>
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const questionPerSlide = parseInt(
                            data?.formSettings?.questionPerSlides || "1"
                          );
                          if (
                            currentIndexes + questionPerSlide <
                            fields.length
                          ) {
                            setCurrentIndexes(
                              (prev) => prev + questionPerSlide
                            );
                          }
                        }}
                        style={{
                          backgroundColor:
                            data?.formSettings?.buttonColor || "",
                        }}
                        className="text-white h-12 font-medium"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                )}
                {data?.formSettings?.displayType !== "slide" && (
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: data?.formSettings?.buttonColor || "",
                    }}
                    className={cn(
                      "self-center w-fit gap-x-2  text-white font-medium h-12 ",
                      !data?.formSettings?.buttonColor && "bg-basePrimary"
                    )}
                  >
                    {loading && (
                      <LoaderAlt className="animate-spin" size={20} />
                    )}
                    <p>{data?.formSettings?.buttonText || "Submit"}</p>
                  </Button>
                )}
                {/* )} */}
              </form>
            </Form>
          </div>
        </div>

        {(isSuccess || isResponseAlreadySubmitted) && <SubmittedModal />}
      </div>
    </>
  );
}

export default function FillForm({
  workspaceAlias,
  formId,
}: {
  workspaceAlias: string;
  formId: string;
}) {
  return (
    <Suspense>
      <FillFormComp formId={formId} workspaceAlias={workspaceAlias} />
    </Suspense>
  );
}

async function uploadFile(file: File | string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", "zikoro");
  formData.append("upload_preset", "w5xbik6z");
  formData.append("folder", "ZIKORO");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/zikoro/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();

      return data.secure_url;
    } else {
      console.error("Failed to upload file");
      return null;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
