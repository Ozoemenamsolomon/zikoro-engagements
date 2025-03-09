"use client";
import { TFormattedEngagementFormAnswer } from "@/types/form";
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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/custom";
import { LuArrowLeftToLine } from "react-icons/lu";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDeleteRequest } from "@/hooks/services/requests";
import * as XLSX from "xlsx";
import { ActionModal } from "@/components/custom/ActionModal";
import {
  IndividualMultiInputType,
  IndividualOtherType,
  IndividualSelectType,
  IndividualTextType,
  IndividualUploadType,
  IndividualYesNoType,
} from "./responseTypes/individual/IndividualResponseType";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formateJSDate } from "@/utils";
import { CustomEmptyState } from "../../qa/_components";

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
  { name: "Country", image: "/fcountry.svg", type: "COUNTRY" },
  {
    name: "Mutiple Choice",
    image: "/fmultiplechoice.png",
    type: "INPUT_MULTIPLE_CHOICE",
  },
];

type IndividualResponseRef = {
  deleteUserData: () => Promise<void>;
  downloadIndividualCSV: () => void;
};

export function getQuestionType(selectType: string) {
  const option = options?.find((s) => s?.type === selectType);
  return {
    image: option?.image,
    name: option?.name,
  };
}
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

export function calculateEngagementStats(
  data: TFormattedEngagementFormAnswer[]
) {
  const attendeesMap: Record<
    string,
    { viewed: number; submitted: number; timeDiffs: number[] }
  > = {};

  for (const entry of data) {
    const alias = entry.attendeeAlias;

    if (!attendeesMap[alias]) {
      attendeesMap[alias] = { viewed: 0, submitted: 0, timeDiffs: [] };
    }

    attendeesMap[alias].viewed += entry.viewed;
    attendeesMap[alias].submitted += entry.submitted;

    if (entry.submitted === 1 && entry.submittedAt && entry.startedAt) {
      const startTime = new Date(entry.startedAt).getTime();
      const submitTime = new Date(entry.submittedAt).getTime();
      const completionTime = (submitTime - startTime) / (1000 * 60);
      attendeesMap[alias].timeDiffs.push(completionTime);
    }
  }

  const totalViewed = Object.values(attendeesMap).filter(
    (a) => a.viewed > 0
  ).length;
  const totalSubmitted = Object.values(attendeesMap).filter(
    (a) => a.submitted > 0
  ).length;
  const completionRate =
    totalViewed > 0 ? (totalSubmitted / totalViewed) * 100 : 0;

  const allCompletionTimes = Object.values(attendeesMap).flatMap(
    (a) => a.timeDiffs
  );
  const averageCompletionTime =
    allCompletionTimes.length > 0
      ? allCompletionTimes.reduce((sum, time) => sum + time, 0) /
        allCompletionTimes.length
      : 0;

  return {
    completionRate: completionRate.toFixed(0) + "%",
    averageCompletionTime: (averageCompletionTime * 60).toFixed(0),
  };
}

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
  const individualResponseRef = useRef<IndividualResponseRef | null>(null);
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

  const inputUpload = useMemo(() => {
    const checkData: { key: TFormattedEngagementFormAnswer[] }[] = [];
    if (data) {
      Object.entries(data).map(([key, values]) => {
        if (
          values?.some(
            (v) => v?.type === "PICTURE_CHOICE" && v?.questionId === key
          )
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
        : entry?.response?.toString();
    });

    return Object.values(result);
  }

  async function downloadCsv(data: TFormattedEngagementFormAnswer[]) {
    try {
      const transformedData = transformData(data);

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
    if (!isSummary) {
      individualResponseRef.current?.deleteUserData();
    } else {
      await deleteData();
    }
    window.location.reload();
  }

  async function download() {
    if (!isSummary) {
      individualResponseRef.current?.downloadIndividualCSV();
    } else {
      downloadCsv(flattenedResponse);
    }
    // window.location.reload();
  }

  function toggleModal() {
    setIsDownload((p) => !p);
  }

  const numberOfViewed =
    flattenedResponse?.reduce((acc, curr) => acc + curr?.viewed, 0) || 0;

  const numberOfSubmitted =
    flattenedResponse?.reduce((acc, curr) => acc + curr?.submitted, 0) || 0;

  const engagementStats = useMemo(() => {
    return calculateEngagementStats(flattenedResponse);
  }, [flattenedResponse]);

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
              <p>
                {isSummary ? "Clear Responses" : "Clear Participant Responses"}
              </p>
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
            onClick={() => setIsSummary(true)}
            className={cn(
              "text-gray-500 py-2 px-3",
              isSummary && "text-basePrimary border-b border-basePrimary"
            )}
          >
            Summary
          </button>
          <button
            onClick={() => setIsSummary(false)}
            className={cn(
              "text-gray-500 py-2 px-3",
              !isSummary && "text-basePrimary border-b border-basePrimary"
            )}
          >
            Individual Response
          </button>
        </div>
        <div className={cn("w-full hidden", isSummary && "block")}>
          <div className="w-full grid h-[150px] grid-cols-3 gap-6">
            <div className="flex flex-col h-full w-full items-center justify-center gap-5">
              <p className="text-lg sm:text-xl">Total Views</p>
              <h1 className="text-[36px] font-bold">{numberOfViewed}</h1>
            </div>
            <div className="flex flex-col border-x h-full w-full items-center justify-center gap-5">
              <p className="text-lg sm:text-xl">Total Submissions</p>
              <h1 className="text-[36px] font-bold">{numberOfSubmitted}</h1>
            </div>
            <div className="flex flex-col h-full w-full items-center justify-center gap-5">
              <p className="text-lg sm:text-xl">Completion Rate</p>
              <h1 className="text-[36px] font-bold">
                {engagementStats?.completionRate}
              </h1>
            </div>
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
                        item?.type === "COUNTRY" ||
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

          {yesOrNo?.length > 0 &&
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

          {inputUpload?.length > 0 &&
            inputUpload?.map((v) => {
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
                      {getQuestionType("PICTURE_CHOICE") && (
                        <Image
                          src={getQuestionType("PICTURE_CHOICE")?.image!}
                          alt=""
                          width={18}
                          height={18}
                          className="object-cover"
                        />
                      )}
                      <p>{getQuestionType("PICTURE_CHOICE")?.name}</p>
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
      </div>

      {!isSummary && (
        <IndividualResponse
          ref={individualResponseRef}
          responses={flattenedResponse}
          downloadCsv={downloadCsv}
        />
      )}
    </>
  );
}

export interface GroupedAttendeeResponse {
  attendeeAlias: string;
  attendeeEmail?: string;
  attendeeId: number | null;
  eventAlias: string;
  formAlias: string;
  viewed: number;
  submitted: number;
  submittedAt?: string;
  startedAt: string;
  responses: Array<{
    questionId: string;
    question: string;
    response?: any;
    type: string;
    questionImage?: string;
    optionFields?: any;
  }>;
}

function FilterActions({
  questions,
  responses,
  setFilter,
  setIsFilter,
  isFilter,
}: {
  questions: { value: string; label: string }[];
  responses: TFormattedEngagementFormAnswer[];
  isFilter: boolean;
  setIsFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setFilter: React.Dispatch<
    React.SetStateAction<TFormattedEngagementFormAnswer[]>
  >;
}) {
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePanel, setDatePanel] = useState(false);
  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start !== null && end !== null) {
      const startIso = start?.toISOString();
      const endIso = end?.toISOString();

      const filtered = responses?.filter(
        (q) => q?.submittedAt >= startIso && q?.submittedAt <= endIso
      );

      setFilter(filtered);
    }
  };
  return (
    <div className="w-full ">
      <div className="w-full fle text-sm flex-col items-start justify-start gap-5">
        <div className="w-full flex items-center justify-between mb-3">
          <div className=" mb-2 flex items-center gap-x-1">
            <InlineIcon icon="mage:filter" fontSize={20} />
            <p>Filter</p>
          </div>

          <button onClick={() => setIsFilter(false)}>
            <LuArrowLeftToLine size={22} />
          </button>
        </div>
        {/** date range */}
        <div className="w-full space-y-3 py-4">
          <p className="">Date Range</p>
          <div className="w-full relative flex items-center gap-x-6">
            <div
              onClick={() => setDatePanel(true)}
              id="start"
              className="flex items-center gap-x-1"
            >
              <InlineIcon
                icon="material-symbols-light:date-range-sharp"
                fontSize={15}
              />
              <p>{startDate ? formateJSDate(startDate) : "Start Date"}</p>
            </div>
            <p>to</p>
            <div
              onClick={() => setDatePanel(true)}
              id="end"
              className="flex items-center gap-x-1"
            >
              <InlineIcon
                icon="material-symbols-light:date-range-sharp"
                fontSize={15}
              />
              <p>{endDate ? formateJSDate(endDate) : "End Date"}</p>
            </div>
            {isDatePanel && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="absolute top-8 right-[-95px] md:right-0"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDatePanel((prev) => !prev);
                  }}
                  className="w-full h-full fixed inset-0 z-[150] "
                ></button>
                <div
                  role="button"
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-[300]"
                >
                  <DatePicker
                    selected={startDate}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={onChange}
                    selectsRange
                    inline
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/** question */}
        <div className="w-full space-y-3 border-y py-4">
          <p className="">Question</p>
          <Select
            onValueChange={(value) => {
              setValue(value);
              const filtered = responses?.filter(
                (q) => q?.questionId === value
              );
              setFilter(filtered);
            }}
            defaultValue={value}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue
                className="bg-basePrimary-100"
                placeholder="Select Question"
              />
            </SelectTrigger>
            <SelectContent className="bg-basePrimary-100">
              <SelectGroup>
                {questions.map(({ value, label }, index) => (
                  <SelectItem
                    key={index}
                    className="h-12 items-center justify-start focus:bg-gray-100"
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/** completion rate range */}
      </div>
    </div>
  );
}

type IndividualResponseProps = {
  responses: TFormattedEngagementFormAnswer[];
  downloadCsv: (param: TFormattedEngagementFormAnswer[]) => void;
};

const IndividualResponse = forwardRef<
  IndividualResponseRef,
  IndividualResponseProps
>(({ responses, downloadCsv }, ref) => {
  const [isFilter, setIsFilter] = useState(false);
  const [filteredQuestions, setFilteredQuestions] =
    useState<TFormattedEngagementFormAnswer[]>(responses);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { deleteData, isLoading } = useDeleteRequest(``);

  useImperativeHandle(ref, () => ({
    deleteUserData,
    downloadIndividualCSV,
  }));

  async function deleteUserData() {
    const form = filteredQuestions[currentIndex];
    await deleteData(
      `/engagements/formAnswer/${form.formAlias}/delete/${form.attendeeAlias}`
    );
  }

  function downloadIndividualCSV() {
    const form = filteredQuestions[currentIndex];
    const filtered = responses?.filter(
      (q) => q?.attendeeAlias === form?.attendeeAlias
    );
    downloadCsv(filtered);
  }

  function groupByAttendee(
    data: TFormattedEngagementFormAnswer[]
  ): GroupedAttendeeResponse[] {
    const groupedMap: Record<string, GroupedAttendeeResponse> = {};

    for (const entry of data) {
      const alias = entry.attendeeAlias;

      if (!groupedMap[alias]) {
        groupedMap[alias] = {
          attendeeAlias: alias,
          attendeeEmail: entry.attendeeEmail,
          attendeeId: entry.attendeeId,
          eventAlias: entry.eventAlias,
          formAlias: entry.formAlias,
          viewed: entry.viewed,
          submitted: entry.submitted,
          submittedAt: entry.submittedAt,
          startedAt: entry.startedAt,

          responses: [],
        };
      } else {
        groupedMap[alias].viewed += entry.viewed;
        groupedMap[alias].submitted += entry.submitted;
      }

      groupedMap[alias].responses.push({
        questionId: entry.questionId,
        question: entry.question,
        response: entry.response,
        type: entry.type,
        questionImage: entry.questionImage,
        optionFields: entry?.optionFields,
      });
    }

    return Object.values(groupedMap);
  }

  const attendeeResponse = useMemo(() => {
    if (Array.isArray(filteredQuestions)) {
      const resp = groupByAttendee(filteredQuestions);

      // setCurrentAttendee(resp[0]);
      // setCurrentIndex(0)

      return resp;
    } else return [];
  }, [filteredQuestions]);

  const questions = useMemo(() => {
    return responses?.map((q) => {
      return {
        value: q?.questionId,
        label: q?.question,
      };
    });
  }, [responses]);

  const completionRate = useMemo(() => {
    if (currentIndex != -1) {
      const currentParticipantId = responses[currentIndex].attendeeAlias;
      const filtered = responses?.filter(
        (v) => v?.attendeeAlias === currentParticipantId
      );

      const attempted = filtered?.filter((v) => v?.response);

      return ((attempted?.length / questions?.length) * 100).toFixed(0);
    } else return "0";
  }, [responses, currentIndex]);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="w-full grid h-[150px] grid-cols-2 gap-6">
        <div className="flex flex-col h-full w-full items-center justify-center gap-5">
          <p className="text-lg sm:text-xl">Date Taken</p>
          <h1 className="text-[36px] font-bold">
            {attendeeResponse[currentIndex]?.submittedAt?.split("T")[0]}
          </h1>
        </div>

        <div className="flex flex-col h-full w-full items-center justify-center gap-5">
          <p className="text-lg sm:text-xl">Completion Rate</p>
          <h1 className="text-[36px] font-bold">{completionRate}%</h1>
        </div>
      </div>

      <div
        className={cn(
          "w-full grid grid-cols-1 gap-6",
          isFilter && "grid-cols-10"
        )}
      >
        <div className={cn("w-full hidden", isFilter && "block col-span-3")}>
          <FilterActions
            questions={questions}
            responses={responses}
            setFilter={setFilteredQuestions}
            setIsFilter={setIsFilter}
            isFilter={isFilter}
          />
        </div>
        <div className={cn("w-full", isFilter && "col-span-7")}>
          {!isFilter && (
            <button
              onClick={() => setIsFilter(true)}
              className=" mb-2 flex items-center gap-x-1 text-mobile"
            >
              <InlineIcon icon="mage:filter" fontSize={15} />
              <p>Filter</p>
            </button>
          )}
          <div className="w-full bg-white rounded-lg  px-6 py-10">
            <div className="flex flex-col items-center justify-center mx-auto gap-3">
              <p className="font-semibold text-base sm:text-lg">
                Participants:
              </p>
              <div className="w-fit flex items-center gap-x-4">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                >
                  {" "}
                  <InlineIcon icon="iconoir:nav-arrow-left" fontSize={22} />
                </button>
                <div className="flex items-center gap-x-2">
                  <h2 className=" font-medium text-lg underline sm:text-xl">
                    {currentIndex + 1}
                  </h2>
                  <p>of</p>
                  <p>{attendeeResponse?.length}</p>
                </div>
                <button
                  disabled={currentIndex === attendeeResponse?.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  <InlineIcon icon="iconoir:nav-arrow-right" fontSize={22} />
                </button>
              </div>
            </div>

            {attendeeResponse[currentIndex] === null ? (
              <CustomEmptyState
                title="No Response"
                description="No Response between the selected dates"
              />
            ) : (
              attendeeResponse[currentIndex]?.responses.map((item, index) => {
                return (
                  <div className="w-full  py-6 mx-auto max-w-xl border-b ">
                    {item.type === "INPUT_TEXT" && (
                      <IndividualTextType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                    {(item.type === "INPUT_DATE" ||
                      item.type === "INPUT_EMAIL" ||
                      item.type === "PHONE_NUMBER" ||
                      item.type === "WEBSITE") && (
                      <IndividualOtherType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                    {item.type === "ATTACHMENT" && (
                      <IndividualUploadType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                    {item.type === "YES_OR_NO" && (
                      <IndividualYesNoType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                    {(item.type === "INPUT_ADDRESS" ||
                      item.type === "CONTACT") && (
                      <IndividualMultiInputType
                        response={item}
                        questionIndex={index}
                      />
                    )}

                    {(item.type === "INPUT_CHECKBOX" ||
                      item.type === "DROPDOWN") && (
                      <IndividualSelectType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                    {item.type === "INPUT_MULTIPLE_CHOICE" && (
                      <IndividualSelectType
                        response={item}
                        questionIndex={index}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
