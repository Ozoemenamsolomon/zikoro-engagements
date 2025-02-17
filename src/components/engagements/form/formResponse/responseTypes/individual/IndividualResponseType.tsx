import { useMemo } from "react";
import { getQuestionType, GroupedAttendeeResponse } from "../../FormResponse";
import Image from "next/image";

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
    <div className="w-full">
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
