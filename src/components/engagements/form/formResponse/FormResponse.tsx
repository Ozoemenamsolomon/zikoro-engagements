"use client";
import {
  TEngagementFormQuestion,
  TFormattedEngagementFormAnswer,
} from "@/types/form";
import { InlineIcon } from "@iconify/react";
import {
  CheckBoxTypeResponse,
  DateTypeResponse,
  MultiInputResponseType,
  RatingTypeResponse,
  TextTypeResponse,
  UploadTypeResponse,
  YesOrNoResponse,
} from "./responseTypes";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/custom";
import { useMemo, useState } from "react";
import { useDeleteRequest } from "@/hooks/services/requests";
import * as XLSX from "xlsx";
import { ActionModal } from "@/components/custom/ActionModal";

const options = [
  { name: "Text", image: "/ftext.png", type: "INPUT_TEXT" },
  { name: "Date", image: "/fdate.png", type: "INPUT_DATE" },
  { name: "CheckBox", image: "/fcheckbox.png", type: "INPUT_CHECKBOX" },
  { name: "Rating", image: "/fstarr.png", type: "INPUT_RATING" },
  { name: "Upload", image: "/fattachment.png", type: "ATTACHMENT" },
  { name: "Picture Choice", image: "/fpicture.png", type: "PICTURE_CHOICE" },
  { name: "Email", image: "/femail.svg", type: "INPUT_EMAIL" },
  { name: "Yes/No", image: "/fyes.svg", type: "YES_OR_NO" },
  { name: "Website", image: "/flink.svg", type: "WEBSITE" },
  { name: "Address", image: "/faddress.svg", type: "INPUT_ADDRESS" },
  { name: "Phone Number", image: "/fphone.svg", type: "PHONE_NUMBER" },
  { name: "Contact", image: "/fcontact.svg", type: "CONTACT" },
  { name: "Dropdown", image: "/fcontact.svg", type: "DROPDOWN" },
];
interface FormResponseProps {
  data:
    | {
        [key: string]: TFormattedEngagementFormAnswer[];
      }
    | undefined;
  flattenedResponse: TFormattedEngagementFormAnswer[];
  //   questions: TEngagementFormQuestion;
  formAlias: string;
  coverTitle: string;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}
type Response = {
  attendeeEmail: string;
  attendeeAlias: string; // NB: not all user registered
  createdAt: string;
  [question: string]: string | undefined;
};

export default function FormResponses({
  data,
  flattenedResponse,
  formAlias,
  coverTitle,
  setActive,
}: FormResponseProps) {
  const [isDeleting, setDeleting] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [isSummary, setIsSummary] = useState(true);
  const { deleteData, isLoading } = useDeleteRequest(
    `/engagements/formAnswer/${formAlias}/delete`
  );
  const inputMultiChoiceCheckBox = useMemo(() => {
    const checkData: { key: TFormattedEngagementFormAnswer[] }[] = [];
    if (data) {
      Object.entries(data).map(([key, values]) => {
        if (
          values?.some(
            (v) => v?.type === "INPUT_MULTIPLE_CHOICE" && v?.questionId === key
          )
        ) {
          checkData.push({ key: values });
        }
      });

      return checkData;
    }
    return [];
  }, [data]);

  const inputCheckBox = useMemo(() => {
    const checkData: { key: TFormattedEngagementFormAnswer[] }[] = [];
    if (data) {
      Object.entries(data).map(([key, values]) => {
        if (
          values?.some(
            (v) => v?.type === "INPUT_CHECKBOX" && v?.questionId === key
          )
        ) {
          checkData.push({ key: values });
        }
      });

      return checkData;
    }
    return [];
  }, [data]);

  const yesOrNo = useMemo(() => {
    const checkData: { key: TFormattedEngagementFormAnswer[] }[] = [];
    if (data) {
      Object.entries(data).map(([key, values]) => {
        if (
          values?.some((v) => v?.type === "YES_OR_NO" && v?.questionId === key)
        ) {
          checkData.push({ key: values });
        }
      });

      return checkData;
    }
    return [];
  }, [data]);

  const inputRating = useMemo(() => {
    const checkData: { key: TFormattedEngagementFormAnswer[] }[] = [];
    if (data) {
      Object.entries(data).map(([key, values]) => {
        if (
          values?.some(
            (v) => v?.type === "INPUT_RATING" && v?.questionId === key
          )
        ) {
          checkData.push({ key: values });
        }
      });

      return checkData;
    }
    return [];
  }, [data]);

  if (!data || (Array.isArray(data) && data?.length === 0)) {
    return (
      <div className="w-[95%] max-w-xl mt-40 mx-auto h-[300px] p-4 rounded-lg gap-y-6  flex flex-col items-center justify-center">
        <InlineIcon
          icon="fluent:emoji-meh-24-regular"
          color="#001fcc"
          fontSize={40}
        />

        <div className="flex gap-y-2 flex-col items-center justify-center ">
          <h2 className="font-semibold text-xl">No responses yet</h2>
          <p>Responses from the participants will appear here</p>
        </div>
      </div>
    );
  }

  function transformData(data: TFormattedEngagementFormAnswer[]) {
    const result: { [alias: string]: Response } = {};

    data.forEach((entry) => {
      const alias = entry.attendeeAlias;
      //  console.log("alias", alias);
      if (!alias) return;

      if (!result[alias]) {
        result[alias] = {
          attendeeAlias: alias,
          attendeeEmail: entry?.attendeeEmail || "NIL",
          createdAt: entry?.created_at?.split("T")[0] ?? "",
        };
      }
      result[alias][entry.question] = Array.isArray(entry.response)
        ? entry.response?.map((v) => v?.selectedOption).toString()
        : entry?.response?.selectedOption
        ? entry?.response?.selectedOption
        : entry?.response;
    });

    return Object.values(result);
  }

  async function downloadCsv() {
    try {
      const transformedData = transformData(flattenedResponse);

      //  console.log(flattenedResponse)

      const worksheet = XLSX.utils.json_to_sheet(transformedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
      XLSX.writeFile(workbook, "response.xlsx");
    } catch (error) {
      console.log(error);
    }
  }

  function toggleDelete() {
    setDeleting((p) => !p);
  }

  async function deleteResponses() {
    await deleteData();
    window.location.reload();
  }

  async function download() {
    downloadCsv();
    // window.location.reload();
  }

  function toggleModal() {
    setIsDownload((p) => !p);
  }

  function getQuestionType(selectType: string) {
    const option = options?.find((s) => s?.type === selectType);
    return {
      image: option?.image,
      name: option?.name,
    };
  }

  return (
    <>
      {isDeleting && (
        <ActionModal
          loading={isLoading}
          asynAction={deleteResponses}
          close={toggleDelete}
          title="Delete Response"
          buttonText="Delete"
        />
      )}
      {isDownload && (
        <ActionModal
          loading={false}
          asynAction={download}
          close={toggleModal}
          buttonText="Download"
          title="Download"
        />
      )}
      <div className="w-full px-4 mx-auto  max-w-7xl text-mobile sm:text-sm sm:px-6 mt-4 sm:mt-6">
        <div className="w-full mb-6 flex items-center justify-between">
          <button
            className="flex items-center gap-x-2"
            onClick={() => setActive(0)}
          >
            <InlineIcon
              icon="material-symbols:arrow-back-rounded"
              fontSize={22}
            />
            <p className="text-sm hidden sm:block">{coverTitle}</p>
          </button>
          <h2 className="font-semibold text-lg sm:text-base">Responses</h2>
          <div className="flex items-center gap-x-2">
            <Button onClick={toggleDelete} className="items-center gap-x-1">
              <InlineIcon
                icon="icon-park-twotone:delete-themes"
                fontSize={22}
              />
              <p>Clear Responses</p>
            </Button>
            <Button
              onClick={toggleModal}
              className="flex items-center bg-basePrimary h-10 text-white rounded-lg gap-x-2"
            >
              <InlineIcon icon="carbon:export" fontSize={18} color="#ffffff" />
              <p>Export as CSV</p>
            </Button>
          </div>
        </div>

        <div className="flex my-8 items-center justify-center w-full gap-x-6">
          <button
            className={cn(
              "text-gray-500 py-2 px-3",
              isSummary && "text-basePrimary border-b border-basePrimary"
            )}
          >
            Summary
          </button>
          <button
            className={cn(
              "text-gray-500 py-2 px-3",
              !isSummary && "text-basePrimary border-b border-basePrimary"
            )}
          >
            Individual Response
          </button>
        </div>

        {Object.entries(data).map(([key, value]) => {
          const response = value?.find((v) => v?.questionId === key);
          const questionIndex = flattenedResponse?.findIndex(
            (v) => v?.questionId === key
          );

          return (
            <div
              key={Math.random()}
              className={cn(
                "w-full rounded-lg bg-white border px-6 py-10 mb-6 sm:mb-8",
                value[0]?.type === "INPUT_MULTIPLE_CHOICE" &&
                  value[0]?.questionId === key &&
                  "hidden",
                value[0]?.type === "INPUT_CHECKBOX" &&
                  value[0]?.questionId === key &&
                  "hidden",
                value[0]?.type === "PICTURE_CHOICE" &&
                  value[0]?.questionId === key &&
                  "hidden",
                value[0]?.type === "INPUT_RATING" &&
                  value[0]?.questionId === key &&
                  "hidden",
                value[0]?.type === "DROPDOWN" &&
                  value[0]?.questionId === key &&
                  "hidden",
                value[0]?.type === "YES_OR_NO" &&
                  value[0]?.questionId === key &&
                  "hidden"
              )}
            >
              <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                {questionIndex + 1}
              </p>

              <div
                className={cn(
                  "w-full hidden flex-col items-start mb-4 sm:mb-6 justify-start",
                  value?.length > 0 && "flex"
                )}
              >
                <div className="flex items-center gap-x-2">
                  {getQuestionType(response?.type!) && (
                    <Image
                      src={getQuestionType(response?.type!)?.image!}
                      alt=""
                      width={18}
                      height={18}
                      className="object-cover"
                    />
                  )}
                  <p>{getQuestionType(response?.type!)?.name}</p>
                </div>
                <div>
                  {response?.question && (
                    <p
                      className="font-medium innerhtml text-sm sm:text-base mb-2"
                      dangerouslySetInnerHTML={{
                        __html: response?.question ?? "",
                      }}
                    />
                  )}
                  {response?.questionImage ? (
                    <Image
                      alt=""
                      width={2000}
                      height={600}
                      className="w-full rounded-lg h-[15rem]"
                      src={response?.questionImage ?? ""}
                    />
                  ) : (
                    ""
                  )}
                </div>
                <p>{value?.length} Responses</p>
              </div>
              {Array.isArray(value) &&
                value?.map((item) => (
                  <div className="w-full">
                    {item?.type === "INPUT_TEXT" && (
                      <div className="w-full flex flex-col items-start justify-start gap-y-2">
                        <TextTypeResponse response={item} />
                      </div>
                    )}
                    {item?.type === "INPUT_DATE" && (
                      <div className="w-full flex flex-col items-center justify-center ">
                        <DateTypeResponse response={item} />
                      </div>
                    )}

                    {item?.type === "ATTACHMENT" && (
                      <div className="w-full flex flex-col items-start justify-start gap-y-2">
                        <UploadTypeResponse response={item} />
                      </div>
                    )}
                    {(item?.type === "INPUT_EMAIL" ||
                      item?.type === "PHONE_NUMBER" ||
                      item?.type === "WEBSITE") && (
                      <div className="w-full flex flex-col items-center justify-center">
                        <div className="w-fit bg-basePrimary-100 rounded-lg  mb-2">
                          <p className="p-3 text-center">
                            {response?.response ?? ""}
                          </p>
                        </div>
                      </div>
                    )}
                    {(item.type === "INPUT_ADDRESS" ||
                      item?.type === "CONTACT") && (
                      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center">
                        <MultiInputResponseType response={item} />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          );
        })}

        {inputCheckBox.length > 0 &&
          inputCheckBox.map((v) => {
            const questionIndex = flattenedResponse?.findIndex(
              (m) => m?.questionId === v?.key[0]?.questionId
            );
            return (
              <div className="w-full bg-white rounded-lg border px-6 py-10 mb-6 sm:mb-8">
                <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                  {questionIndex + 1}
                </p>
                <div
                  className={cn(
                    "w-full flex flex-col items-start mb-4 sm:mb-6 justify-start"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {getQuestionType("INPUT_CHECKBOX") && (
                      <Image
                        src={getQuestionType("INPUT_CHECKBOX")?.image!}
                        alt=""
                        width={18}
                        height={18}
                        className="object-cover"
                      />
                    )}
                    <p>{getQuestionType("INPUT_CHECKBOX")?.name}</p>
                  </div>
                  <div>
                    {v?.key[0]?.question && (
                      <p
                        className="font-medium innerhtml text-sm sm:text-base mb-2"
                        dangerouslySetInnerHTML={{
                          __html: v?.key[0]?.question ?? "",
                        }}
                      />
                    )}
                    {v?.key[0]?.questionImage ? (
                      <Image
                        alt=""
                        width={2000}
                        height={600}
                        className="w-full rounded-lg h-[15rem]"
                        src={v?.key[0]?.questionImage ?? ""}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <p>{v?.key?.length} Responses</p>
                </div>
                <CheckBoxTypeResponse type="single" responses={v?.key} />
              </div>
            );
          })}

        {inputMultiChoiceCheckBox.length > 0 &&
          inputMultiChoiceCheckBox.map((v) => {
            const questionIndex = flattenedResponse?.findIndex(
              (m) => m?.questionId === v?.key[0]?.questionId
            );
            return (
              <div className="w-full bg-white rounded-lg border px-6 py-10 mb-6 sm:mb-8">
                <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                  {questionIndex + 1}
                </p>
                <div
                  className={cn(
                    "w-full flex flex-col items-start mb-4 sm:mb-6 justify-start"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {getQuestionType("INPUT_MULTIPLE_CHOICE") && (
                      <Image
                        src={getQuestionType("INPUT_MULTIPLE_CHOICE")?.image!}
                        alt=""
                        width={18}
                        height={18}
                        className="object-cover"
                      />
                    )}
                    <p>{getQuestionType("INPUT_MULTIPLE_CHOICE")?.name}</p>
                  </div>
                  <div>
                    {v?.key[0]?.question && (
                      <p
                        className="font-medium innerhtml text-sm sm:text-base mb-2"
                        dangerouslySetInnerHTML={{
                          __html: v?.key[0]?.question ?? "",
                        }}
                      />
                    )}
                    {v?.key[0]?.questionImage ? (
                      <Image
                        alt=""
                        width={2000}
                        height={600}
                        className="w-full rounded-lg h-[15rem]"
                        src={v?.key[0]?.questionImage ?? ""}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <p>{v?.key?.length} Responses</p>
                </div>
                <CheckBoxTypeResponse type="multi" responses={v?.key} />
              </div>
            );
          })}

        {inputRating.length > 0 &&
          inputRating.map((v) => {
            const questionIndex = flattenedResponse?.findIndex(
              (m) => m?.questionId === v?.key[0]?.questionId
            );
            return (
              <div className="w-full bg-white rounded-lg border px-6 py-10 mb-6 sm:mb-8">
                <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                  {questionIndex + 1}
                </p>
                <div
                  className={cn(
                    "w-full flex flex-col items-start mb-4 sm:mb-6 justify-start"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {getQuestionType("INPUT_RATING") && (
                      <Image
                        src={getQuestionType("INPUT_RATING")?.image!}
                        alt=""
                        width={18}
                        height={18}
                        className="object-cover"
                      />
                    )}
                    <p>{getQuestionType("INPUT_RATING")?.name}</p>
                  </div>
                  <div>
                    {v?.key[0]?.question && (
                      <p
                        className="font-medium innerhtml text-sm sm:text-base mb-2"
                        dangerouslySetInnerHTML={{
                          __html: v?.key[0]?.question ?? "",
                        }}
                      />
                    )}
                    {v?.key[0]?.questionImage ? (
                      <Image
                        alt=""
                        width={2000}
                        height={600}
                        className="w-full rounded-lg h-[15rem]"
                        src={v?.key[0]?.questionImage ?? ""}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <p>{v?.key?.length} Responses</p>
                </div>
                <RatingTypeResponse responses={v?.key} />
              </div>
            );
          })}

        {yesOrNo.length > 0 &&
          yesOrNo.map((v) => {
            const questionIndex = flattenedResponse?.findIndex(
              (m) => m?.questionId === v?.key[0]?.questionId
            );
            return (
              <div className="w-full bg-white rounded-lg border px-6 py-10 mb-6 sm:mb-8">
                <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                  {questionIndex + 1}
                </p>
                <div
                  className={cn(
                    "w-full flex flex-col items-start mb-4 sm:mb-6 justify-start"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {getQuestionType("YES_OR_NO") && (
                      <Image
                        src={getQuestionType("YES_OR_NO")?.image!}
                        alt=""
                        width={18}
                        height={18}
                        className="object-cover"
                      />
                    )}
                    <p>{getQuestionType("YES_OR_NO")?.name}</p>
                  </div>
                  <div>
                    {v?.key[0]?.question && (
                      <p
                        className="font-medium innerhtml text-sm sm:text-base mb-2"
                        dangerouslySetInnerHTML={{
                          __html: v?.key[0]?.question ?? "",
                        }}
                      />
                    )}
                    {v?.key[0]?.questionImage ? (
                      <Image
                        alt=""
                        width={2000}
                        height={600}
                        className="w-full rounded-lg h-[15rem]"
                        src={v?.key[0]?.questionImage ?? ""}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <p>{v?.key?.length} Responses</p>
                </div>
                <YesOrNoResponse responses={v?.key} />
              </div>
            );
          })}
      </div>
    </>
  );
}
