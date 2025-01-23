"use client";

import { TQuiz, TQuestion } from "@/types/quiz";
import { TOrganization } from "@/types/home";
import { useState, useEffect, useMemo } from "react";
import { usePostRequest } from "@/hooks/services/requests";
import { Switch } from "@/components/ui/switch";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { Button } from "@/components/custom";
export function QuizIntegration({
  quiz,
  refetch,
  organization,
}: {
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
  organization: TOrganization;
}) {
  const [loading, setLoading] = useState(false);

  const { postData, isLoading } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [accessibility, setAccessibility] = useState(quiz?.accessibility);

  useEffect(() => {
    if (quiz && quiz?.accessibility !== null) {
      setAccessibility(quiz?.accessibility);
    }
  }, [quiz]);
  const isQuiz = useMemo(() => {
    return quiz.interactionType === "quiz";
  }, [quiz]);

  async function onSubmit() {
    setLoading(true)
    await postData({ payload : {
        ...quiz,
        accessibility : {
          ...accessibility,
          isCollectEmail: accessibility.visible ?true :false
        }
    } });
    setLoading(false);
    refetch();
  }
  

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Connect {isQuiz ? " Quiz " : " Poll "} to an Event</p>
          <p className="text-tiny text-gray-500">
            Participants must provide their email to confirm event registration
            before being allowed to participate.  {isQuiz ? "Quiz" : "Poll"} points will be added to
            their Zikoro event participant points.
           
          </p>
        </div>
        <Switch
          disabled={loading}
          checked={accessibility?.visible}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              visible: !accessibility.visible,
              
            })
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