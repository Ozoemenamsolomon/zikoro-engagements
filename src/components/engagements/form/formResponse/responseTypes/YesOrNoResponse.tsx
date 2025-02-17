import { TFormattedEngagementFormAnswer } from "@/types/form";

export function YesOrNoResponse({
  responses,
}: {
  responses: TFormattedEngagementFormAnswer[];
}) {
  const numberOfYes = responses?.filter((v) => v?.response === "Yes")?.length;
  const numberOfNo = responses?.filter((v) => v?.response === "No")?.length;
  const percentageOfYes = numberOfYes / responses?.length;
  const percentageOfNo = numberOfNo / responses?.length;

  return (
    <div className="w-full space-y-5  max-w-lg mx-auto">
        {/** YES */}
      <div className="w-full flex justify-start gap-x-2 items-center">
        <p className="font-bold rounded-lg bg-white text-2xl h-11 w-11 flex items-center justify-center border border-black">
          Y
        </p>
        <div className="w-[80%] flex flex-col">
          <div className="w-full flex items-center justify-between">
            <p className="text-sm">Yes</p>

            <div className="flex items-center gap-x-1">
              <p className="text-mobile">{numberOfYes} Resp.</p>
              <p className="font-semibold text-lg">{`${(
                percentageOfYes * 100
              ).toFixed(0)}%`}</p>
            </div>
          </div>
          <div className="w-full relative h-[0.75rem] rounded-3xl bg-basePrimary-100">
            <span
              style={{
                width: `${(percentageOfYes * 100).toFixed(0)}%`,
              }}
              className="h-full bg-basePrimary rounded-3xl inset-0 absolute z-10"
            ></span>
          </div>
        </div>
      </div>

      {/** NO */}
      <div className="w-full flex justify-start gap-x-2 items-center">
        <p className="font-bold rounded-lg bg-white text-2xl h-11 w-11 flex items-center justify-center border border-black">
          N
        </p>
        <div className="w-[80%] flex flex-col">
          <div className="w-full flex items-center justify-between">
            <p className="text-sm">No</p>

            <div className="flex items-center gap-x-1">
              <p className="text-mobile">{numberOfNo} Resp.</p>
              <p className="font-semibold text-lg">{`${(
                percentageOfNo * 100
              ).toFixed(0)}%`}</p>
            </div>
          </div>
          <div className="w-full relative h-[0.75rem] rounded-3xl bg-basePrimary-100">
            <span
              style={{
                width: `${(percentageOfNo * 100).toFixed(0)}%`,
              }}
              className="h-full bg-basePrimary rounded-3xl inset-0 absolute z-10"
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}
