import { TFormattedEngagementFormAnswer } from "@/types/form";

export function TextTypeResponse({
  response,
}: {
  response: TFormattedEngagementFormAnswer;
}) {
  return (
    <div className="w-full mb-2">
      <p className="border flex-col items-start p-3 w-full rounded-lg flex gap-2">
        <span>{response?.attendeeEmail ?? ""}</span>
        <span
        className="innerhtml"
        dangerouslySetInnerHTML={{
          __html: response?.response ?? ""
        }}
        />
      </p>
    </div>
  );
}
