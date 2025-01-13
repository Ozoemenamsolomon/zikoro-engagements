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

export function OrganizerOnboarding({
  close,
  refetch,
  id,
  organization,
  isLobby,
  setisLobby,
  audio,
  quiz,
  onToggle,
  isLeftBox,
  liveQuizPlayers,
  refetchLobby,
}: {
  close: () => void;

  refetch: () => Promise<any>;
  id: string;
  refetchLobby?: () => Promise<any>;
  isLobby: boolean;
  setisLobby: React.Dispatch<React.SetStateAction<boolean>>;
  attendeeId?: number;
  audio?: HTMLAudioElement | null;
  quiz: TQuiz<TQuestion[]>;
  onToggle: () => void;
  isLeftBox: boolean;
  liveQuizPlayers: TLiveQuizParticipant[];
  organization: TOrganization;
}) {
  const { postData: updateQuiz } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
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

  const isMaxLiveParticipant = useMemo(() => {
    if (
      quiz?.accessibility?.live &&
      liveQuizPlayers?.length >= 15000 &&
      organization?.subscriptionPlan === "Enterprise"
    ) {
      return true;
    } else if (
      quiz?.accessibility?.live &&
      liveQuizPlayers?.length >= 1000 &&
      organization?.subscriptionPlan === "Professional"
    ) {
      return true;
    } else if (
      quiz?.accessibility?.live &&
      liveQuizPlayers?.length >= 200 &&
      organization?.subscriptionPlan === "Lite"
    ) {
      return true;
    } else {
      return false;
    }
  }, [quiz?.accessibility?.live, quiz, liveQuizPlayers, organization]);

  function onClose() {
    setisLobby(false);
    close();
  }

  // organizer start live quiz
  async function startLiveQuiz() {
    setLoading(true);
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      liveMode: { startingAt: new Date().toISOString() },
    };
    await updateQuiz({ payload });
    refetch();
    setisLobby(true);
    setLoading(false);
    if (audio) {
      audio.volume = 0.05;
      audio.play();
    }
  }

  useEffect(() => {
    if (!quiz?.liveMode?.startingAt) return;
    const currentTime = new Date();
    const quizStartingTime = new Date(quiz?.liveMode?.startingAt);
    let interval = setInterval(() => {
      if (isLobby && isAfter(currentTime, quizStartingTime)) {
        refetch();
      } else {
        clearInterval(interval);
      }
    }, 2000);
  }, []);

  // show the lobby if organizer has already started the quiz
  useEffect(() => {
    if (quiz?.accessibility?.live && quiz?.liveMode?.startingAt) {
      setisLobby(true);
      if (audio) {
        audio.volume = 0.05;
        audio.play();
      }
    }
  }, [quiz]);

  return (
    <>
      <div
        className={cn(
          "w-full h-fit px-4 md:px-10 col-span-full lg:px-20 py-8 flex gap-y-6 sm:gap-y-10 flex-col items-center justify-center ",
          isLobby && "hidden"
        )}
      >
        <div className="w-full flex items-center justify-center flex-col gap-y-2">
          {(isMaxParticipant || isMaxLiveParticipant) && (
            <p className="text-xs sm:text-mobile text-gray-600">
              Maximum limit has been reached.{" "}
            </p>
          )}
        </div>
      </div>

      {isLobby && (
        <QuizLobby
          goBack={() => setisLobby(false)}
          quiz={quiz}
          close={onClose}
          refetch={refetch}
          isMaxLiveParticipant={isMaxLiveParticipant}
          liveQuizPlayers={liveQuizPlayers}
          isLeftBox={isLeftBox}
          onToggle={onToggle}
          refetchLobby={refetchLobby}
          id={id}
        />
      )}
    </>
  );
}
