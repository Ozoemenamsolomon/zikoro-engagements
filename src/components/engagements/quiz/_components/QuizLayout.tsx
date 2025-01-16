import { cn } from "@/lib/utils";

export function QuizLayout({
  children,
  LeadingWidget,
  TrailingWidget,
  className,
  parentClassName
}: {
  LeadingWidget?: React.ReactNode;
  TrailingWidget?: React.ReactNode;
  className?:string;
  children: React.ReactNode;
  parentClassName?:string;
}) {
  return (
    <div className={cn("w-full px-4 inset-0 text-sm h-[85vh] m-auto absolute", parentClassName)}>
      <div className="w-full flex items-center p-3 sm:p-0 mb-2 justify-between">
        {LeadingWidget}
        {TrailingWidget}
      </div>
      <div className={cn("w-full h-full bg-white rounded-lg border", className)}>{children}</div>
    </div>
  );
}
