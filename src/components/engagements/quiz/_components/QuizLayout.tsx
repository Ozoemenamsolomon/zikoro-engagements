
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { calculateAndSetWindowHeight } from "@/utils";
export function QuizLayout({
  children,
  LeadingWidget,
  TrailingWidget,
  className,
  parentClassName,

}: {
  LeadingWidget?: React.ReactNode;
  TrailingWidget?: React.ReactNode;
  className?:string;
  children: React.ReactNode;
  parentClassName?:string;

}) {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (divRef) {
  calculateAndSetWindowHeight(divRef)
    }
  },[divRef])
  return (
    <div className={cn("w-full px-4 inset-0 text-sm h-[85vh] m-auto absolute", parentClassName)}>
      <div className="w-full flex items-center p-3 sm:p-0 mb-2 justify-between">
        {LeadingWidget}
        {TrailingWidget}
      </div>
      <div ref={divRef} className={cn("w-full bg-white rounded-lg border", className)}>{children}</div>
    </div>
  );
}
