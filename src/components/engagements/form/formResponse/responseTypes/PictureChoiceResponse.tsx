"use client";

import { TFormattedEngagementFormAnswer } from "@/types/form";
import Image from "next/image";
import { useMemo } from "react";

export function PictureChoiceTypeResponse({
  responses,
}: {
  responses: TFormattedEngagementFormAnswer[];
}) {
  const flattenedResponse = responses;
  const optionArray = flattenedResponse[0]?.optionFields;

  const reformedArray: { value: number; option: string }[] = useMemo(() => {
    const mappedArray = optionArray.map((v: any, index: number) => {
      const selectedCount = flattenedResponse.filter((selected) => {
        return selected.response?.optionId === v.id;
      }).length;

      return {
        option: v?.image,
        value: selectedCount || 0,
      };
    });
    return mappedArray;
  }, [responses]);

  const sum = useMemo(() => {
    return reformedArray.reduce((acc, curr) => acc + curr?.value, 0) || 0;
  }, [reformedArray]);

  return (
    <div className="w-full  max-w-lg mx-auto">
      <div className="w-full flex flex-col items-start justify-start gap-4">
        {reformedArray?.map((item, index) => {
          return (
            <div key={index} className="w-full flex items-center gap-x-3">
              <Image
                src={item.option}
                className="w-[90px] h-[90px] rounded-lg object-cover"
                alt=""
                width={180}
                height={180}
              />
              <div className="flex flex-col items-start justify-start gap-1 w-[80%]">
                <div className="self-end flex items-center gap-x-1">
                  <p className="text-mobile">{item?.value} Resp.</p>
                  <p className="font-medium text-lg">{`${(
                    (item?.value / sum) *
                    100
                  ).toFixed(0)}%`}</p>
                </div>
                <div className="w-full relative h-[0.75rem] rounded-3xl bg-basePrimary-100">
                  <span
                    style={{
                      width: `${((item?.value / sum) * 100).toFixed(0)}%`,
                    }}
                    className="h-full bg-basePrimary rounded-3xl inset-0 absolute z-10"
                  ></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
