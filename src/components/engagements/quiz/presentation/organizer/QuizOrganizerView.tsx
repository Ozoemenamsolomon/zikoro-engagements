"use client";

import {
  useDeleteRequest,
  useGetData,
  usePostRequest,
} from "@/hooks/services/requests";
import { TOrganization } from "@/types/home";
import {
  TAnswer,
  TLiveQuizParticipant,
  TQuestion,
  TQuiz,
  TRefinedQuestion,
} from "@/types/quiz";
import { Button } from "@/components/custom";
import {
  FullScreenIcon,
  NextQuestionIcon,
  PlayQuizIcon,
  SpeakerIcon,
} from "@/constants";
import { OrganizerOnboarding } from "./_components/OrganizerOnboarding";
import { useEffect, useMemo, useState } from "react";
import { isAfter } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  useGetAnswer,
  useGetLiveParticipant,
  useGetQuiz,
  useGetQuizAnswer,
} from "@/hooks/services/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { QuizLobby } from "../common";
import { generateAlias } from "@/utils";
import { AvatarFullConfig } from "react-nice-avatar";
import { TPlayerDetail } from "../attendee/_components/AttendeeOnboarding";
import { Advert, LeaderBoard } from "./_components";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

// audio instance
function createAudioInstance(music: string) {
  if (typeof window !== undefined) {
    const audio = new Audio(music);
    //  audio.src = "audio/AylexCinematic.mp3";
    audio.loop = true;

    return audio;
  }
  return null;
}

const supabase = createClient();

export default function QuizOrganizerView({
  quizId,
  workspaceAlias,
}: {
  quizId: string;
  workspaceAlias: string;
}) {
  const { quiz, getQuiz: getData, setQuiz, isLoading } = useGetQuiz({ quizId }); // hooks for fetching the a single quiz
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );
  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [startingLiveQuiz, setStartingLiveQuiz] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isRightBox, setRightBox] = useState(true); // state to toggle advert panel visibility
  const [isLeftBox, setLeftBox] = useState(true); // state to toggle leaderboard panel visibility
  const { answers, getAnswers, setAnswers } = useGetQuizAnswer(); // hook to fetch all quiz answers
  const [isSendMailModal, setIsSendMailModal] = useState(false); // state to toggle send-mail modal after attendee finishes the quiz
  const [showScoreSheet, setShowScoreSheet] = useState(false); // state to toggle show-score sheet after attendee finishes the quiz
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isLobby, setIsLobby] = useState(false);
  const params = useSearchParams();
  const [isAdvert, setIsAdvert] = useState(true);
  const { liveQuizPlayers, setLiveQuizPlayers, getLiveParticipant } =
    useGetLiveParticipant({
      quizId: quizId,
    });
  const query = params.get("redirect");
  const aId = params.get("id");
  // const {liveQuizPlayers} = useGetLiveParticipant({quizId})
  const { deleteData: deleteQuizLobby } = useDeleteRequest<
    TLiveQuizParticipant[]
  >(`engagements/quiz/participant/${quiz?.quizAlias}`);

  const [chosenAvatar, setChosenAvatar] =
    useState<Required<AvatarFullConfig> | null>(null);
  // quiz result stores the state for quiz that is currently being answered by the attendee (for attendees only)
  const [quizResult, setQuizResult] = useState<TQuiz<
    TRefinedQuestion[]
  > | null>(null);
  const { answer, getAnswer } = useGetAnswer(); // hook to fetch a single question answer
  const [playerDetail, setPlayerDetail] = useState<TPlayerDetail>({
    phone: "",
    email: "",
    nickName: "",
  });
  // const player = getCookie<TConnectedUser>("player");

  const [refinedQuizArray, setRefinedQuizArray] = useState<TQuiz<
    TRefinedQuestion[]
  > | null>(null);

  // subscribe to quiz
  useEffect(() => {
    // function subscribeToUpdate() {
    if (!quiz?.accessibility?.live) return;
    const channel = supabase
      .channel("live-quiz")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz",
          filter: `quizAlias=eq.${quizId}`,
        },
        (payload) => {
          setQuiz(payload.new as TQuiz<TQuestion[]>);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);

  function createBeep() {
    if (typeof window !== undefined) {
      if (quiz?.accessibility?.playMusic && quiz?.accessibility?.music) {
        const audio = new Audio(quiz?.accessibility?.music?.value);
        //  audio.src = "audio/AylexCinematic.mp3";

        audio.volume = 0.2;

        audio.play();
      }
    }
  }
  // subscribe to player
  useEffect(() => {
    if (!quiz?.accessibility?.live) return;
    const channel = supabase
      .channel("live-players")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quizLobby",
          filter: `quizAlias=eq.${quiz?.quizAlias}`,
        },
        (payload) => {
          // console.log("new", payload.new);
          setLiveQuizPlayers((prev) => [
            ...prev,
            payload.new as TLiveQuizParticipant,
          ]);
          createBeep();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);
  // memoized audio instance

  // subscribe to answers
  useEffect(() => {
    if (!quiz?.accessibility?.live) return;
    const channel = supabase
      .channel("live-answer")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quizAnswer",
          filter: `quizId=eq.${quiz?.id}`,
        },
        (payload) => {
          setAnswers((prev) => [...prev, payload.new as TAnswer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);

  // memoized audio instance
  const audio = useMemo(() => {
    if (quiz?.accessibility?.playMusic && quiz?.accessibility?.music) {
      return createAudioInstance(quiz?.accessibility?.music?.value);
    }
  }, []);

  // organizer start live quiz
  async function startLiveQuiz() {
    setStartingLiveQuiz(true);
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      liveMode: { startingAt: new Date().toISOString() },
    };
    await postData({ payload });
    getData();
    setIsLobby(true);
    setStartingLiveQuiz(false);
    if (audio) {
      audio.volume = 0.05;
      audio.play();
    }
  }

  // show the lobby if organizer has already started the quiz
  useEffect(() => {
    if (quiz?.accessibility?.live && quiz?.liveMode?.startingAt) {
      setIsLobby(true);
      if (audio) {
        audio.volume = 0.05;
        audio.play();
      }
    }
  }, [quiz]);

  // ion know
  useEffect(() => {
    if (!quiz?.liveMode?.startingAt) return;
    const currentTime = new Date();
    const quizStartingTime = new Date(quiz?.liveMode?.startingAt);
    let interval = setInterval(() => {
      if (isLobby && isAfter(currentTime, quizStartingTime)) {
        getData();
      } else {
        clearInterval(interval);
      }
    }, 2000);
  }, []);

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

  // generate a unique id for player
  const id = useMemo(() => {
    //TODO if redirect, return;
    if (query) return aId!;
    return generateAlias();
  }, [query]);

  // toggle leaderboard
  function onClose() {
    setLeftBox((prev) => !prev);
  }

  // toggle advert panel
  function onToggle() {}

  // for updating current player quiz, but later restructured
  function updateQuiz(quiz: TQuiz<TRefinedQuestion[]>) {
    setRefinedQuizArray(quiz);
  }

  // also for updating current player quiz, and used to show the answer sheet
  function updateQuizResult(quiz: TQuiz<TRefinedQuestion[]>) {
    setQuizResult(quiz);
  }

  function onClickStart() {
    if (isAdvert) {
      setIsAdvert(false);

      if (quiz?.accessibility?.live) {
        setIsLobby(true);
        setLeftBox(true);
        setRightBox(false);
        return;
      }
      if (!quiz?.accessibility?.live) {
        setIsQuizStarted(true);
        setLeftBox(true);
        setRightBox(false);
        return;
      }
      
    }
    if (isLobby) {
      setIsQuizStarted(true);
      return;
    }
    
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full min-h-screen px-4  mx-auto  flex flex-col justify-between">
      <div className="w-full  gap-4 items-start grid grid-cols-12">
        {isAdvert && quiz && (
          <OrganizerOnboarding
            isMaxLiveParticipant={isMaxLiveParticipant}
            quiz={quiz}
            organization={organization}
            isLobby={isLobby}
            isAdvert={isAdvert}
          />
        )}
        {!isAdvert && isLobby && quiz && quiz?.accessibility?.live && (
          <div className="w-full h-[78vh] col-span-full gap-4 mt-10 items-start rounded-lg grid grid-cols-12">
            {quiz && (
              <Advert
                quiz={quiz}
                isLeftBox={isLeftBox}
                isRightBox={isRightBox}
                isFromPoll={true}
                close={() => {}}
              />
            )}

            {
              <QuizLobby
                goBack={() => {
                  setIsLobby(false);
                  setIsAdvert(true);
                }}
                quiz={quiz}
                close={() => setIsLobby(false)}
                refetch={getData}
                isMaxLiveParticipant={isMaxLiveParticipant}
                liveQuizPlayers={liveQuizPlayers}
                isLeftBox={isLeftBox}
                onToggle={() => {
                  setRightBox((prev) => !prev);
                  setLeftBox((prev) => !prev);
                }}
                refetchLobby={getLiveParticipant}
                id={id}
                className={cn(
                  "relative px-0 m-0  h-full border-y border-r col-span-9",
                  !isLeftBox && "col-span-full rounded-lg border"
                )}
              />
            }
          </div>
        )}
        {isQuizStarted && (
          <div className="w-full h-[78vh] col-span-full gap-4 mt-10 items-start rounded-lg grid grid-cols-12">
            {quiz && (
              <Advert
                quiz={quiz}
                isLeftBox={isLeftBox}
                isRightBox={isRightBox}
                isFromPoll={true}
                close={() => {}}
              />
            )}
            
            {quiz && (
              <LeaderBoard
                isRightBox={isRightBox}
                isLeftBox={isLeftBox}
                close={onToggle}
                quiz={quiz}
                answers={answers}
              />
            )}
          </div>
        )}
      </div>

      <div className="w-full py-4">
        <div className="w-fit mx-auto flex items-center gap-x-3 justify-center rounded-[3rem] bg-white border p-2">
          <Button
            onClick={onClickStart}
            className="rounded-3xl h-fit bg-basePrimary-200 px-2 border border-basePrimary gap-x-2"
          >
            <PlayQuizIcon />
            <p className="bg-basePrimary text-sm sm:text-base gradient-text">
              Start Quiz
            </p>
          </Button>
          <Button className="px-0 w-fit h-fit">
            <NextQuestionIcon />
          </Button>
          <Button className="px-0 w-fit h-fit">
            <SpeakerIcon />
          </Button>
          <Button className="px-0 w-fit h-fit">
            <FullScreenIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
