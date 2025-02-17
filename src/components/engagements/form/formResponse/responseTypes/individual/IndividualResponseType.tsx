import { useMemo } from "react";
import { getQuestionType, GroupedAttendeeResponse } from "../../FormResponse";
import Image from "next/image";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { saveAs } from "file-saver";
import { Star } from "styled-icons/fluentui-system-regular";
import { StarFullOutline } from "styled-icons/typicons";
import { cn } from "@/lib/utils";
function IndividualQuestion({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  const questType = useMemo(() => {
    return getQuestionType(response.type);
  }, [response]);

  return (
    <div className="w-full mb-6">
      <p className="w-14 h-14 flex text-2xl mx-auto mb-6 items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
        {questionIndex + 1}
      </p>
      <div className="w-full flex flex-col items-start mb-4 sm:mb-6 justify-start">
        <div className="flex items-center gap-x-2">
          {questType && (
            <Image
              src={questType?.image!}
              alt=""
              width={18}
              height={18}
              className="object-cover"
            />
          )}
          <p>{questType?.name}</p>
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
      </div>
    </div>
  );
}

export function IndividualTextType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-full p-2 bg-basePrimary-100">
        <span
          className="innerhtml"
          dangerouslySetInnerHTML={{
            __html: response?.response ?? "",
          }}
        />
      </div>
    </div>
  );
}

export function IndividualPictureType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="mx-auto p-2">
        <Image
          alt="imge"
          className="w-[90px] rounded-lg object-cover h-[90px]"
          src={response?.response}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
}

export function IndividualOtherType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-fit mx-auto bg-basePrimary-100 p-2">
        <span
          className="innerhtml"
          dangerouslySetInnerHTML={{
            __html: response?.response ?? "",
          }}
        />
      </div>
    </div>
  );
}

export function IndividualUploadType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-full mx-auto bg-basePrimary-100 p-2">
        <div className="flex w-[80%]  items-center gap-x-2">
          <InlineIcon icon="solar:file-bold-duotone" fontSize={24} />
          <p>{response?.response?.name ?? ""}</p>
        </div>

        <button
          onClick={() => {
            saveAs(response?.response?.fileData, "download");
          }}
          className="flex items-center gap-x-1"
        >
          <p>Download</p>
          <InlineIcon icon="et:download" fontSize={18} />
        </button>
      </div>
    </div>
  );
}

export function IndividualYesNoType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-fit mx-auto">
        {response?.response === "Yes" ? (
          <div className="bg-basePrimary-100 flex items-center gap-x-2 rounded-lg p-2">
            <p className="font-bold rounded-lg text-2xl h-11 w-11 flex items-center justify-center border border-black">
              Y
            </p>
            <p className="text-sm">Yes</p>
          </div>
        ) : (
          <div className="bg-basePrimary-100 flex items-center gap-x-2 rounded-lg p-2">
            <p className="font-bold rounded-lg text-2xl h-11 w-11 flex items-center justify-center border border-black">
              N
            </p>
            <p className="text-sm">No</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function IndividualMultiInputType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      {Object.entries(response?.response).map(([key, value]) => (
        <div
          key={key}
          className="w-full py-2 flex items-center justify-between"
        >
          <p>{key}</p>
          <p className="text-start font-medium">{value as string}</p>
        </div>
      ))}
    </div>
  );
}

export function IndividualRatingType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-full flex flex-wrap items-center gap-x-2 justify-center">
        {Array.from({ length: response?.optionFields as number })?.map(
          (v, index) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              key={index}
              style={{
                color: index + 1 <= response?.response ? "#001fcc" : "",
              }}
              className={cn("text-gray-400")}
            >
              {index + 1 <= response?.response ? (
                <StarFullOutline size={24} />
              ) : (
                <Star size={24} />
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}



export function IndividualSelectType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

      <div className="w-fit mx-auto bg-basePrimary-100 p-2">
        <span
          className="innerhtml"
          dangerouslySetInnerHTML={{
            __html: response?.response?.selectedOption ?? "",
          }}
        />
      </div>
    </div>
  );
}

export function IndividualMultiSelectType({
  response,
  questionIndex,
}: {
  questionIndex: number;
  response: GroupedAttendeeResponse["responses"][number];
}) {
  return (
    <div className="w-full">
      <IndividualQuestion questionIndex={questionIndex} response={response} />

    {Array.isArray(response?.response) && response.response?.map((item: any, index) => (
        <div
        key={index}
        className="w-fit mx-auto bg-basePrimary-100 p-2">
        <span
          className="innerhtml"
          dangerouslySetInnerHTML={{
            __html: item?.selectedOption ?? "",
          }}
        />
      </div>
    ))}
    </div>
  );
}