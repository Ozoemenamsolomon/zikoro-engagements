"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";


export function FormIntegration({
    form,
  }: {
    form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
  }) {
    return (
        <div className="w-full flex "></div>
    )
}