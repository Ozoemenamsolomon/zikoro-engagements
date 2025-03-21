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
  AddressTypeAnswer,
  ContactTypeAnswer,
  YesNoTypeAnswer,
  DropDownTypeAnswer,
  CountryTypeAnswer,
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
import Link from "next/link";
import { toast } from "react-toastify";
import { getQuestionType } from "../formResponse/FormResponse";

function SubmittedModal({
  data,
  formLink,
  bgColor,
  textColor,
  btnColor
}: {
  data: TEngagementFormQuestion;
  formLink: string;
  bgColor:string;
  textColor:string;
  btnColor:string;
}) {
 

  const socials = useMemo(() => {
    const formSetting = data?.formSettings;
    return [
      {
        image: "/end-u-x.svg",
        url: formSetting?.endScreenSettings?.x || "https://zikoro.com",
      },
      {
        image: "/end-u-fb.svg",
        url: formSetting?.endScreenSettings?.facebook || "https://zikoro.com",
      },
      {
        image: "/end-u-in.svg",
        url: formSetting?.endScreenSettings?.linkedIn || "https://zikoro.com",
      },
    ];
  }, [data]);

  const showLinks = useMemo(() => {
    return data?.formSettings?.endScreenSettings
      ? data?.formSettings?.endScreenSettings?.socialLink
      : true;
  }, [data]);

  const showButton = useMemo(() => {
    return data?.formSettings?.endScreenSettings
      ? data?.formSettings?.endScreenSettings?.showButton
      : true;
  }, [data]);
  return (
    <div
    style={{
      backgroundColor: bgColor,
      backgroundImage: data?.formSettings?.isPreMade
        ? `url('${data?.formSettings?.preMadeType}')`
        : data?.formSettings?.isBackgroundImage
        ? `url('${data?.formSettings?.backgroundImage}')`
        : "",
      filter: data?.formSettings?.isBackgroundImage
        ? `brightness(${data?.formSettings?.backgroundBrightness})`
        : "",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: textColor,
    }}
    className="w-full h-full inset-0 fixed bg-white">
         <h2 className="text-xl font-semibold">
          {data?.formSettings?.endScreenSettings?.title ??
            "Thanks for completing the form"}
        </h2>

        {showLinks && (
          <div className="flex items-center gap-x-3 justify-center mx-auto">
            {socials?.map((item) => (
              <button onClick={() => window.open(item?.url)}>
                <Image
                  src={item?.image}
                  alt=""
                  className="w-[40px] h-[40px]"
                  width={100}
                  height={100}
                />
              </button>
            ))}
          </div>
        )}

        <p>
          {data?.formSettings?.endScreenSettings?.subText ??
            "This is all for now"}
        </p>
        {showButton && (
          <Button
            style={{
              backgroundColor: btnColor,
            }}
            className="font-medium text-white rounded-xl"
          >
            {data?.formSettings?.endScreenSettings?.buttonText ??
              "Create your form"}
          </Button>
        )}
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
  const attendeeAlias = params.get("attendeeAlias");
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
  const { postData: postRecipientCertData } = usePostRequest(
    "/certificate/recipient"
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
      startedAt: new Date().toISOString(),
      viewed: 1,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  const [currentQuestions, setCurrentQuestion] = useState(fields);

  async function onSubmit(values: z.infer<typeof formAnswerSchema>) {
    //  console.log(values); formEngagementPoints

    const { questions, startedAt, ...restData } = values;

    // checking if all the required fields are filled ==> STARTS
    const reformedData = questions?.map((val) => {
      return {
        type: val?.selectedType,
        questionId: val?.questionId,
        response: restData?.responses?.find(
          (res) => res?.questionId === val?.questionId
        )?.response,
      };
    });

    for (let data of reformedData) {
      if (!data?.response || data?.response === "") {
        return toast.error(`${getQuestionType(data?.type!)} is required`);
        break;
      }
    }

    // ====> ENDS

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
      submittedAt: new Date().toISOString(),
      submitted: 1,
    };

    await postData({ payload });

    //   post certificate data
    if (data?.integrationAlias) {
      const payload = {
        integrationAlias: data?.integrationAlias,
        answers: values?.responses,
        createdBy: data?.createdBy,
      };

      await postRecipientCertData({ payload });
    }

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
      if (attendeeAlias) {
        await getAttendee(workspaceAlias, attendeeAlias);
      }
    })();
  }, [attendeeAlias]);

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

  // console.log(isLoading, attendeeLoading);
  const btnColor = useMemo(() => {
    if (data?.formSettings?.isPreMade) {
      return data?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#8841FD";
    } else return data?.formSettings?.buttonColor || "#001fcc";
  }, [data]);
  const rgba = useMemo(
    (alpha = 0.1) => {
      if (data) {
        const color = btnColor;
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);

        // Increase brightness (lighter color)
        const lightenFactor = 1.3; // Increase for more brightness
        r = Math.min(255, Math.floor(r * lightenFactor));
        g = Math.min(255, Math.floor(g * lightenFactor));
        b = Math.min(255, Math.floor(b * lightenFactor));

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    },
    [data, btnColor]
  );
  const textColor = useMemo(() => {
    if (data?.formSettings?.isPreMade) {
      return data?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#190044";
    } else return data?.formSettings?.textColor || "#000000";
  }, [data]);

  const bgColor = useMemo(() => {
    if (data?.formSettings?.isPreMade) {
      return data?.formSettings?.preMadeType;
    } else if (data?.formSettings?.isBackgroundImage) {
      return data?.formSettings?.backgroundImage;
    } else return data?.formSettings?.backgroundColor || "#ffffff";
  }, [data]);

  const optionLetter = useMemo(() => {
    if (data?.formSettings?.labellingType === "Number") {
      return ["1", "2", "3", "4"];
    } else return ["A", "B", "C", "D"];
  }, [data]);

  

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
          <div
            style={{
              backgroundColor: bgColor,
              backgroundImage: data?.formSettings?.isPreMade
                ? `url('${data?.formSettings?.preMadeType}')`
                : data?.formSettings?.isBackgroundImage
                ? `url('${data?.formSettings?.backgroundImage}')`
                : "",
              filter: data?.formSettings?.isBackgroundImage
                ? `brightness(${data?.formSettings?.backgroundBrightness})`
                : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              color: textColor,
            }}
            className="w-full h-full inset-0 fixed z-[100] bg-white"
          >
            <div className="w-[95%] max-w-xl border rounded-lg bg-gradient-to-b gap-y-6 from-white  to-basePrimary/20  h-[400px] flex flex-col items-center justify-center shadow absolute inset-0 m-auto">
              <InlineIcon
                icon="fluent:emoji-sad-20-regular"
                fontSize={60}
                color="#001fcc"
              />
              <div className="w-fit flex flex-col items-center justify-center gap-y-3">
                <p>You are not a registered attendee for this event</p>

                <Button
                  style={{
                    backgroundColor: btnColor,
                  }}
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
        <div
        style={{
          backgroundColor: bgColor,
          backgroundImage: data?.formSettings?.isPreMade
            ? `url('${data?.formSettings?.preMadeType}')`
            : data?.formSettings?.isBackgroundImage
            ? `url('${data?.formSettings?.backgroundImage}')`
            : "",
          filter: data?.formSettings?.isBackgroundImage
            ? `brightness(${data?.formSettings?.backgroundBrightness})`
            : "",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: textColor,
        }}
          className="w-full min-h-screen p-6 bg-white justify-center inset-0 fixed z-[100] flex flex-col items-center gap-y-8"
        >
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
            className="text-lg capitalize mb-3 sm:text-xl lg:text-2xl"
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
              backgroundColor: btnColor,
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

      <div className={cn("w-screen min-h-screen", isLoading && "hidden")}>
        <div
             style={{
              backgroundColor: bgColor,
              backgroundImage: data?.formSettings?.isPreMade
                ? `url('${data?.formSettings?.preMadeType}')`
                : data?.formSettings?.isBackgroundImage
                ? `url('${data?.formSettings?.backgroundImage}')`
                : "",
              filter: data?.formSettings?.isBackgroundImage
                ? `brightness(${data?.formSettings?.backgroundBrightness})`
                : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              color: textColor,
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
                      className={cn(
                        "w-full",
                        data?.formSettings?.displayType !== "slide" &&
                          "border bg-white/10 p-4 sm:p-6 rounded-lg"
                      )}
                      key={`${field.id}`}
                    >
                      {(field.selectedType === "INPUT_TEXT" ||
                        field.selectedType === "INPUT_EMAIL" ||
                        field.selectedType === "WEBSITE" ||
                        field.selectedType === "PHONE_NUMBER") && (
                        <TextTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          selectedType={field.selectedType}
                          btnColor={btnColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "INPUT_ADDRESS" && (
                        <AddressTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          selectedType={field.selectedType}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "DROPDOWN" && (
                        <DropDownTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "COUNTRY" && (
                        <CountryTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "YES_OR_NO" && (
                        <YesNoTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          textColor={textColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "CONTACT" && (
                        <ContactTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          selectedType={field.selectedType}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "INPUT_DATE" && (
                        <DateTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          rgba={rgba || "#F7F8FF"}
                          btnColor={btnColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "INPUT_CHECKBOX" && (
                        <CheckboxTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          btnColor={btnColor}
                          rgba={rgba || "#F7F8FF"}
                          textColor={textColor}
                          optionLetter={optionLetter}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "INPUT_RATING" && (
                        <RatingTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          btnColor={btnColor}
                          rgba={rgba || "#F7F8FF"}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "ATTACHMENT" && (
                        <UploadTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          btnColor={btnColor}
                          rgba={rgba || "#F7F8FF"}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "INPUT_MULTIPLE_CHOICE" && (
                        <MultiChoiceTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          btnColor={btnColor}
                          rgba={rgba || "#F7F8FF"}
                          textColor={textColor}
                          optionLetter={optionLetter}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                      {field.selectedType === "PICTURE_CHOICE" && (
                        <ImageUploadTypeAnswer
                          form={form}
                          index={index + currentIndexes}
                          btnColor={btnColor}
                          rgba={rgba || "#F7F8FF"}
                          textColor={textColor}
                          hideNumber={data?.formSettings?.hideNumber}
                          hideLabel={data?.formSettings?.hideLabel || false}
                        />
                      )}
                    </div>
                  );
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
                        color: btnColor || "",
                        border: `1px solid ${btnColor}`,
                      }}
                      className="border h-11 px-6 font-medium"
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
                          backgroundColor: btnColor,
                        }}
                        className={cn(
                          "self-center w-fit gap-x-2 px-6 text-white font-medium h-12 "
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
                          backgroundColor: btnColor,
                        }}
                        className="text-white h-11 font-medium"
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
                      backgroundColor: btnColor,
                    }}
                    className={cn(
                      "self-center w-fit gap-x-2  text-white font-medium h-12 px-6 ",
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

        {(isSuccess || isResponseAlreadySubmitted) && (
          <SubmittedModal
            data={data}
            bgColor={bgColor || "#fff"}
            btnColor={btnColor}
            textColor={textColor}
            formLink={`https://engagements.zikoro.com/e/${data?.workspaceAlias}/form/a/${data?.formAlias}`}
          />
        )}
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
