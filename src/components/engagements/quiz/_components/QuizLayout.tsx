import { cn } from "@/lib/utils";

export function QuizLayout({
  children,
  LeadingWidget,
  TrailingWidget,
  className
}: {
  LeadingWidget?: React.ReactNode;
  TrailingWidget?: React.ReactNode;
  className?:string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full px-4 inset-0 text-sm max-w-7xl h-[85vh] m-auto absolute">
      <div className="w-full flex items-center mb-2 justify-between">
        {LeadingWidget}
        {TrailingWidget}
      </div>
      <div className={cn("w-full h-full bg-white rounded-lg border", className)}>{children}</div>
    </div>
  );
}
