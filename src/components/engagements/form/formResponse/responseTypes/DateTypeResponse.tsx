import { TFormattedEngagementFormAnswer } from "@/types/form";

export function DateTypeResponse({
  response,
}: {
  response: TFormattedEngagementFormAnswer;
}) {
  return (
    <div className="w-fit bg-basePrimary-100 rounded-lg  mb-2">
      <p className="p-3 text-center">{response?.response ?? ""}</p>
    </div>
  );
}
