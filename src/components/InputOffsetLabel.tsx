import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { cn } from "@/lib/utils";

export default function InputOffsetLabel({
  children,
  label,
  isRequired,
  append,
  prepend,
  className
}: {
  children: React.ReactNode;
  label: string;
  isRequired?: boolean;
  append?: React.ReactNode;
  prepend?: React.ReactNode;
  className?:string
}) {
  return (
    <FormItem className={cn("relative space-y-4 w-full",className)}>
      <FormLabel className="mb-2 text-gray-600">
        {label}
        {isRequired && <sup className="text-red-700">*</sup>}
      </FormLabel>
   
      <FormControl className="!mt-0">
        <div
          className={` w-full`}
        >
          <div className="w-full relative ">
          {append && (
        <div className="absolute !my-0 left-1 z-10 h-full flex items-center">
          {append}
        </div>
      )}
      {prepend && (
        <div className="absolute !my-0 right-1 z-10 h-full flex items-center">
          {prepend}
        </div>
      )}
            {children}
          </div>
        </div>
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}

{/**
${append ? "[&>*]:pl-8" : ""} ${
            prepend ? "[&>*]:pr-8" : ""
          } 
  */}