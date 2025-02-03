"use client";

import { Button } from "@/components/custom";
import { CreateForm } from "@/components/dashboard/_components/create/CreateForm";
import { cn } from "@/lib/utils";
import { TEngagementFormQuestion } from "@/types/form";
import { TOrganization } from "@/types/home";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

export enum FormSettingType {
  details,
  accessibility,
  general,
}

export function FormSettings({
  close,
  refetch,
  organization,
  form,
}: {
  form: TEngagementFormQuestion;
  close: () => void;
  refetch: () => Promise<any>;
  organization: TOrganization;
}) {
  const [active, setActive] = useState<FormSettingType>(
    FormSettingType.details
  );

  return (
    <div
      onClick={close}
      className="w-screen h-screen fixed inset-0 bg-white/50 z-[100] "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="right-0 min-h-screen animate-float-in border vert-scroll inset-y-0 absolute max-w-3xl w-full bg-white overflow-y-auto"
      >
        <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
          <div className="w-full flex items-center justify-between">
            <h2>Form Settings</h2>
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
            {["Details", "Accessibility", "General"].map((v, index) => (
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
          {FormSettingType.details === active && (
            <CreateForm
              engagementForm={form}
              refetch={refetch}
              organization={organization}
            />
          )}
        </div>
      </div>
    </div>
  );
}
