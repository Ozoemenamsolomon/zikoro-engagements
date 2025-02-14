"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import { useGetUserEngagements } from "@/hooks/services/engagement";

export function FormIntegration({
    form,
  }: {
    
    form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
  }) {
    const {
      qas,
      qaLoading,
      quizLoading,
      quizzes,
      getQas,
      getQuizzes,
      getForm,
      forms,
      formLoading,
    } = useGetUserEngagements();
    return (
        <div className="w-full flex "></div>
    )
}