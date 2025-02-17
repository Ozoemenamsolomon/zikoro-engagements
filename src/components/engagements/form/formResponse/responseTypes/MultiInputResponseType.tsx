import { TFormattedEngagementFormAnswer } from "@/types/form";

export function MultiInputResponseType({
  response,
}: {
  response: TFormattedEngagementFormAnswer;
}) {
  return (
    <div className="w-full  border-b p-2 mb-2">
      {Object.entries(response?.response).map(([key, value]) => (
        <div key={key} className="w-full py-2 flex items-center justify-between">
          <p>{key}</p>
          <p className="text-start font-medium">{value as string}</p>
        </div>
      ))}
    </div>
  );
}
