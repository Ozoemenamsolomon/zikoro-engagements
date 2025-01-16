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
import { useEffect, useMemo, useRef, useState } from "react";
import { isAfter } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  useGetAnswer,
  useGetLiveParticipant,
  useGetQuiz,
  useGetQuizAnswer,
} from "@/hooks/services/quiz";
import { LoadingState } from "@/components/composables/LoadingState";
import { QuizLobby, QuizLobbyRef } from "../common";
import { generateAlias } from "@/utils";
import { AvatarFullConfig } from "react-nice-avatar";
import { TPlayerDetail } from "../attendee/_components/AttendeeOnboarding";
import {
  Advert,
  LeaderBoard,
  QuestionView,
  QuestionViewRef,
} from "./_components";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { ScoreBoard } from "../common/ScoreBoard";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

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
  const questionViewRef = useRef<QuestionViewRef>(null);
  const quizLobbyRef = useRef<QuizLobbyRef>(null);
  const [volume, adjustVolume] = useState(0.05);
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
      .subscribe((status) => {
        console.log("Subscription status QuIZ:", status);
      });

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
      .subscribe((status) => {
        console.log("Subscription status PLAYER:", status);
      });

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
      .subscribe((status) => {
        console.log("Subscription status: ANSWR", status);
      });

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

  
  useEffect(() => {
    if (quiz?.accessibility?.live && quiz?.liveMode?.startingAt) {
   
      if (audio) {
        audio.volume = 0.05;
        audio.play();
      }
    }
  }, [quiz?.liveMode?.startingAt]);


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



  useEffect(() => {
    if (quiz) {
      const refinedArray = {
        ...quiz,
        questions: quiz?.questions?.map((item) => {
          return {
            ...item,
            options: item?.options?.map((option) => {
              return {
                ...option,
                isCorrect: "default",
              };
            }),
          };
        }),
      };
      setRefinedQuizArray(refinedArray);

      getAnswers(quiz?.id);
    }
  }, [quiz]);

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

  async function onClickStart() {
    if (isAdvert) {
      setIsAdvert(false);

      if (quiz?.accessibility?.live) {
        setIsLobby(true);
        setLeftBox(true);
       // setRightBox(false);
        startLiveQuiz();
        return;
      }
      if (!quiz?.accessibility?.live) {
        setIsQuizStarted(true);
        setLeftBox(true);
        //setRightBox(false);
        return;
      }
    }
    console.log("reach here");
    if (isLobby) {
      if (quiz?.accessibility?.live && quizLobbyRef?.current) {
        await quizLobbyRef.current.openQuestion();
      }
      setIsQuizStarted(true);
      setIsLobby(false)
      return;
    }
  }

  function onCloseScoreSheet() {
    setShowScoreSheet(false);
  }

  function onOpenScoreSheet() {
    setShowScoreSheet(true);
    setIsSendMailModal(true);
  }

  function showSendMailModal() {
    setIsSendMailModal(false);
    setShowScoreSheet(true);
  }

  // show score sheet after live quiz
  useEffect(() => {
    (async () => {
      if (quiz && quiz?.accessibility?.live) {
        if (quiz?.liveMode?.isEnded) {
          // saveCookie("currentPlayer", null);
          setShowScoreSheet(quiz?.liveMode?.isEnded);
          setIsSendMailModal(true);
          if (audio) audio.pause();
          //  if (liveQuizPlayers?.length > 0) {
          await deleteQuizLobby();
          //  }
        }
      }
    })();
  }, [quiz]);

  // change audio state
  function toggleAudio() {
    if (audio) {
      setIsAudioMuted(!audio.muted);
      audio.muted = !audio.muted;
    }
  }

  // audio volume change
  function handleVolume(num: number) {
    if (audio) {
      adjustVolume(num);
      audio.volume = num;
    }
  }

  // if (isLoading) {
  //   return <></>;
  // }

  console.log("left", isLeftBox, "right", isRightBox, "lobby", isLobby,"advert", isAdvert )

  console.log(quiz)

  return (
    <>
      {showScoreSheet ? (
        <div className="w-full ">
          <ScoreBoard
            answers={answers}
            id={id}
            quiz={quizResult}
            actualQuiz={quiz}
            close={() => {
              setShowScoreSheet(false);
              if (audio) audio.pause();
            }}
          />
        </div>
      ) : (
        <div className="w-full min-h-screen px-4  mx-auto  flex flex-col justify-between">
          <div className="w-full  items-start grid grid-cols-12">
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
              <div className="w-full h-[78vh] col-span-full mx-auto  mt-10 items-start rounded-lg grid grid-cols-12">
                {quiz && (
                  <Advert
                    quiz={quiz}
                    isLeftBox={isLeftBox}
                    isRightBox={isRightBox}
                    isFromPoll={true}
                    close={() => {
                      setRightBox((prev) => !prev)
                    }}
                    className={cn("col-span-3", !isRightBox && !quiz?.accessibility?.live && "col-span-full max-w-2xl mx-auto")}
                  />
                )}

                {
                  <QuizLobby
                    ref={quizLobbyRef}
                    goBack={() => {
                      setIsLobby(false);
                      setIsAdvert(true);
                    }}
                    quiz={quiz}
                    close={() => {
                      setIsLobby(false);
                      setIsQuizStarted(true);
                    }}
                    refetch={getData}
                    isMaxLiveParticipant={isMaxLiveParticipant}
                    liveQuizPlayers={liveQuizPlayers}
                    isLeftBox={isLeftBox}
                    onToggle={() => {
                      setRightBox(true);
                      setLeftBox((prev) => !prev);
                    }}
                    refetchLobby={getLiveParticipant}
                    id={id}
                    className={cn(
                      "relative px-0 m-0  h-full border-y border-r rounded-r-lg col-span-9",
                      !isLeftBox && "col-span-full rounded-lg border mx-auto",
                      !isRightBox && !quiz?.accessibility?.live && "hidden"
                    )}
                  />
                }
              </div>
            )}
            {isQuizStarted && (
              <div className="w-full h-[78vh] col-span-full mt-10 items-start rounded-lg grid grid-cols-12">
                {quiz && (
                  <Advert
                    quiz={quiz}
                    isLeftBox={isLeftBox}
                    isRightBox={isRightBox}
                    isFromPoll={true}
                    close={() => {}}
                    className={cn("", !isLeftBox && "flex md:flex", isRightBox && "col-span-3 max-w-full",!isRightBox && !isLeftBox && "hidden md:hidden" )}
                  />
                )}
                {quiz && refinedQuizArray && (
                  <QuestionView
                    ref={questionViewRef}
                    isLeftBox={isLeftBox}
                    answer={answer}
                    quizAnswer={answers}
                    getAnswer={getAnswer}
                    refetchQuiz={getData}
                    refetchQuizAnswers={getAnswers}
                    quiz={refinedQuizArray}
                    actualQuiz={quiz!}
                    getLiveParticipant={getLiveParticipant}
                    isRightBox={isRightBox}
                    toggleRightBox={() => {
                  
                      setLeftBox((prev) => !prev);
                    }}
                    toggleLeftBox={() => {
                      setRightBox((prev) => !prev)
                    }}
                    onOpenScoreSheet={onOpenScoreSheet}
                    updateQuiz={updateQuiz}
                    updateQuizResult={updateQuizResult}
                    quizParticipantId={id}
                    liveQuizPlayers={liveQuizPlayers}
                    attendeeDetail={{
                      attendeeId: id || null,
                      attendeeName: playerDetail?.nickName,
                      email: playerDetail?.email,
                      phone: playerDetail?.phone,
                      avatar: chosenAvatar!,
                    }}
                    className={cn("", !isLeftBox && "col-span-9 max-w-full relative m-0 h-full sm:h-full rounded-none rounded-r-lg", !isRightBox && "col-span-9 rounded-r-lg", !isLeftBox && !isRightBox && "rounded-l-lg  max-w-4xl col-span-full mx-auto")}
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
                onClick={onClickStart} //startLiveQuiz
                className={cn(
                  "rounded-[3rem] h-fit bg-basePrimary-200 px-2 border border-basePrimary gap-x-2",
                  isQuizStarted && "border-red-500 bg-red-100"
                )}
              >
                {isQuizStarted ? (
                  <InlineIcon
                    fontSize={52}
                    color="#ef4444"
                    icon="solar:stop-circle-bold-duotone"
                  />
                ) : (
                  <PlayQuizIcon />
                )}
                <p className={cn("text-red-500 text-sm sm:text-base ", !isQuizStarted && "gradient-text bg-basePrimary")}>
                  {isQuizStarted ? "End Quiz" : "Start Quiz"}
                </p>
              </Button>
            {!isAdvert &&  <Button
                disabled={
                  questionViewRef.current !==  null &&
                  (questionViewRef.current.loading ||
                    questionViewRef.current?.isUpdating)
                }
                onClick={() => {
                  if (questionViewRef.current) {
                    questionViewRef.current.onNextBtnClick();
                  }
                }}
                title="Next Question"
                className="px-0 w-fit h-fit"
              >
                <NextQuestionIcon />
              </Button>}
              <Button title="Play Music" className="px-0 w-fit h-fit">
                <SpeakerIcon />
              </Button>
              <Button className="px-0 w-fit h-fit">
                <FullScreenIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
