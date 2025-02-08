"use client";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
import { cn } from "@/lib/utils";

export function FormIntegration({
    form,
  }: {
    form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
  }) {
    return (
        <div></div>
    )
}