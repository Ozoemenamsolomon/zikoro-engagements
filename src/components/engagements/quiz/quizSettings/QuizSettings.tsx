"use client";
import { Button } from "@/components/custom";
import { CreateQuiz } from "@/components/dashboard/_components/create";
import { cn } from "@/lib/utils";
import { TOrganization } from "@/types/home";
import { TQuestion, TQuiz } from "@/types/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { QuizAccessibility, QuizBranding } from "./_components";

export enum QuizSettingType {
  details,
  accessibility,
  branding,
}

export function QuizSettings({
  close,
  quiz,
  refetch,
  organization,
}: {
  close: () => void;
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
  organization: TOrganization;
}) {
  const [active, setActive] = useState<QuizSettingType>(
    QuizSettingType.details
  );
  return (
    <div className="right-0 min-h-screen animate-float-in  inset-y-0 fixed z-[100] max-w-3xl w-full bg-white overflow-y-auto">
      <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
        <div className="w-full flex items-center justify-between">
          <h2>Quiz Settings</h2>
          <Button
            onClick={close}
            className="h-10 w-10 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
          >
            <InlineIcon
              icon={"mingcute:close-line"}
              fontSize={22}
              color="#ffffff"
            />
          </Button>
        </div>

        <div className="w-fit flex my-6 mx-auto items-center justify-center">
          {["Details", "Accessibility", "Branding"].map((v, index) => (
            <button
              onClick={() => setActive(index)}
              className={cn(
                "px-6 py-3 border-b-2",
                active === index && "text-basePrimary border-basePrimary"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        {QuizSettingType.details === active && (
          <CreateQuiz quiz={quiz} refetch={refetch} organization={organization} />
        )}
        {QuizSettingType.accessibility === active && (
          <QuizAccessibility
            organization={organization}
            refetch={refetch}
            quiz={quiz}
          />
        )}
        {QuizSettingType.branding === active && (
          <QuizBranding refetch={refetch} quiz={quiz} />
        )}
      </div>
    </div>
  );
}
