"use client";

import { TQuestion, TQuiz } from "@/types/quiz";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { usePostRequest } from "@/hooks/services/requests";
import { Button } from "@/components/custom";
export function QuizBranding({
  quiz,
  refetch,
}: {
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
}) {
  const { postData, isLoading } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [branding, setBranding] = useState({
    eventName: false,
    poweredBy: false,
  });
  const [loading, setLoading] = useState(false);
  async function onSubmit() {
    setLoading(true);
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      branding: branding,
    };

    await postData({ payload });
    setLoading(false);
    refetch();
  }
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <p>Show Quiz Name</p>
        <Switch
          disabled={loading}
          checked={branding?.eventName}
          onClick={() =>
            setBranding({ ...branding, eventName: !branding?.eventName })
          }
          className=""
        />
      </div>
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <p>Show Powered by Zikoro</p>
        <Switch
          checked={branding?.poweredBy}
          disabled={loading}
          onClick={() =>
            setBranding({ ...branding, poweredBy: !branding?.poweredBy })
          }
          className=""
        />
      </div>
      <Button
        onClick={onSubmit}
        disabled={loading}
        className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
      >
        {loading && <LoaderAlt size={20} className="animate-spin" />}
        <p>Update</p>
      </Button>
    </div>
  );
}
