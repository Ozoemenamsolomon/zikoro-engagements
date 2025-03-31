
import { cn } from "@/lib/utils";
import { useRef, useEffect, CSSProperties } from "react";
import { calculateAndSetWindowHeight } from "@/utils";
export function EngagementLayout({
  children,
  LeadingWidget,
  TrailingWidget,
  CenterWidget,
  className,
  parentClassName,
  style

}: {
  LeadingWidget?: React.ReactNode;
  TrailingWidget?: React.ReactNode;
  CenterWidget?: React.ReactNode;
  className?:string;
  children: React.ReactNode;
  parentClassName?:string;
  style?:CSSProperties

}) {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (divRef) {
  calculateAndSetWindowHeight(divRef)
    }
  },[divRef]);
  
  return (
    <div className={cn("w-full px-4 inset-0 text-sm h-[85vh] m-auto absolute", parentClassName)}>
      <div className="w-full flex items-center p-3 sm:p-0 mb-2 justify-between">
        {LeadingWidget}
        {CenterWidget}
        {TrailingWidget}
      </div>
      <div ref={divRef} style={style} className={cn("w-full bg-white rounded-lg border", className)}>{children}</div>
    </div>
  );
}
