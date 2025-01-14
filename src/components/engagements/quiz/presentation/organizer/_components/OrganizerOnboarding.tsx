"use client";
import { useEffect, useMemo, useState } from "react";
import { QuizLobby } from "../../common";
import { cn } from "@/lib/utils";
import { isAfter } from "date-fns";
import { TLiveQuizParticipant, TQuestion, TQuiz } from "@/types/quiz";
import { useRealtimePresence } from "@/hooks/services/quiz";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostRequest } from "@/hooks/services/requests";
import { TOrganization } from "@/types/home";
import { Advert } from "./Advert";

export function OrganizerOnboarding({
  organization,
  isLobby,
  quiz,
  isMaxLiveParticipant,
  isAdvert
}: {

  isLobby: boolean;
  quiz: TQuiz<TQuestion[]>;
  organization: TOrganization;
  isMaxLiveParticipant:boolean;
  isAdvert:boolean;
}) {

  const params = useSearchParams();
  const query = params.get("redirect");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useRealtimePresence(quiz?.accessibility?.live);

  const isMaxParticipant = useMemo(() => {
    if (
      !quiz?.accessibility?.live &&
      quiz?.quizParticipants?.length >= 15000 &&
      organization?.subscriptionPlan === "Enterprise"
    ) {
      return true;
    } else if (
      !quiz?.accessibility?.live &&
      quiz?.quizParticipants?.length >= 1000 &&
      organization?.subscriptionPlan === "Professional"
    ) {
      return true;
    } else if (
      !quiz?.accessibility?.live &&
      quiz?.quizParticipants?.length >= 200 &&
      organization?.subscriptionPlan === "Lite"
    ) {
      return true;
    } else {
      return false;
    }
  }, [quiz?.accessibility?.live, quiz, organization]);

  



 

  return (
    <>
      <div
        className={cn(
          "w-full px-4 h-[78vh] md:px-10 animate-float-in col-span-full",
          isLobby && "hidden"
        )}
      >
        <Advert
          quiz={quiz}
          isLeftBox={true}
          isRightBox={true}
          isAdvert={isAdvert}
          isFromPoll={true}
          close={() => {}}
        />
        <div className="w-full flex items-center justify-center flex-col gap-y-2">
          {(isMaxParticipant || isMaxLiveParticipant) && (
            <p className="text-xs sm:text-mobile text-gray-600">
              Maximum limit has been reached.{" "}
            </p>
          )}
        </div>
      </div>

   
    </>
  );
}
