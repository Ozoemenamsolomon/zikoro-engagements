"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  useDeleteRequest,
  useGetData,
  usePostRequest,
} from "@/hooks/services/requests";
import {
  useGetAnswer,
  useGetLiveParticipant,
  useGetQuiz,
  useGetQuizAnswer,
} from "@/hooks/services/quiz";
import { TOrganization } from "@/types/home";
import {
  TAnswer,
  TLiveQuizParticipant,
  TQuestion,
  TQuiz,
  TRefinedQuestion,
} from "@/types/quiz";
import { useSearchParams } from "next/navigation";
import { AvatarFullConfig } from "react-nice-avatar";
import {
  AttendeeOnboarding,
  TPlayerDetail,
} from "./_components/AttendeeOnboarding";
import { isAfter } from "date-fns";
import { generateAlias } from "@/utils";
import { QuizLobby } from "../common";
import { QuestionView } from "../organizer/_components";
import { SendMailModal } from "./_components/SendMailModal";
import { ScoreBoard } from "../common/ScoreBoard";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import PreviewDeletionGuard from "../common/PreviewDeleteGuard";
import _ from "lodash";

// audio instance
function createAudioInstance(music: string) {
  console.log("music", music);
  if (typeof window !== undefined) {
    const audio = new Audio(music);
    //  audio.src = "audio/AylexCinematic.mp3";
    audio.loop = true;

    return audio;
  }
  return null;
}

const supabase = createClient();

export default function QuizAttendeeView({
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
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const { answers, getAnswers, setAnswers } = useGetQuizAnswer(); // hook to fetch all quiz answers
  const [isSendMailModal, setIsSendMailModal] = useState(false); // state to toggle send-mail modal after attendee finishes the quiz
  const [showScoreSheet, setShowScoreSheet] = useState(false); // state to toggle show-score sheet after attendee finishes the quiz
  const params = useSearchParams();
  const [isLobby, setIsLobby] = useState(false);
  const [isYetToOnboard, setIsYetToOnboard] = useState(true);
  const { deleteData: deleteQuizLobby } = useDeleteRequest<
    TLiveQuizParticipant[]
  >(`engagements/quiz/participant/${quiz?.quizAlias}`);
  const [isQuizResult, setIsQuizResult] = useState(false);

  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");

  const { liveQuizPlayers, setLiveQuizPlayers, getLiveParticipant } =
    useGetLiveParticipant({
      quizId: quizId,
    });
  const [chosenAvatar, setChosenAvatar] =
    useState<Required<AvatarFullConfig> | null>(null);
  // quiz result stores the state for quiz that is currently being answered by the attendee (for attendees only)
  const [quizResult, setQuizResult] = useState<TQuiz<
    TRefinedQuestion[]
  > | null>(null);
  const [refinedQuizArray, setRefinedQuizArray] = useState<TQuiz<
    TRefinedQuestion[]
  > | null>(null);
  const { answer, getAnswer } = useGetAnswer(); // hook to fetch a single question answer
  const [playerDetail, setPlayerDetail] = useState<TPlayerDetail>({
    phone: "",
    email: "",
    nickName: "",
  });
  const query = params.get("redirect");
  const aId = params.get("id");
  const type = params.get("type");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
        console.log("Subscription status: QUIZ", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);

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
        }
      )
      .subscribe((status) => {
        console.log("Subscription status: LIVEPLAYER", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);

  // subscribe to answers
  useEffect(() => {
    if (!quiz?.accessibility?.live) return;
    const channel = supabase.channel("live-answer");

      // channel.on(
      //   "postgres_changes",
      //   {
      //     event: "UPDATE",
      //     schema: "public",
      //     table: "quizAnswer",
      //     filter: `quizId=eq.${quiz?.id}`,
      //   },
      //   (payload) => {
      //     setAnswers((prev) => [...prev, payload.new as TAnswer]);
      //   }
      // )

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quizAnswer",
          filter: `quizId=eq.${quiz?.id}`,
        },
        (payload) => {
        //  console.log("new answer data", payload.new)
        setAnswers((prev) => _.uniqBy([...prev, payload.new as TAnswer], "id"));
          
        }
      )

      channel.subscribe((status) => {
        console.log("Subscription status: ANSWER", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quiz]);

  // memoized audio instance
  useMemo(() => {
    if (quiz?.accessibility?.playMusic && quiz?.accessibility?.music) {
      if (!audio || audio.paused) {
        setAudio(createAudioInstance(quiz?.accessibility?.music?.value));
      }
    }
  }, [quiz]);

  //   // show the lobby if organizer has already started the quiz
  //   useEffect(() => {
  //     if (quiz?.accessibility?.live && quiz?.liveMode?.startingAt) {
  //       setIsLobby(true);
  //       if (audio) {
  //         audio.volume = 0.05;
  //         audio.play();
  //       }
  //     }
  //   }, [quiz]);

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

  // for updating current player quiz, but later restructured
  function updateQuiz(quiz: TQuiz<TRefinedQuestion[]>) {
    setRefinedQuizArray(quiz);
  }

  // also for updating current player quiz, and used to show the answer sheet
  function updateQuizResult(quiz: TQuiz<TRefinedQuestion[]>) {
    setQuizResult(quiz);
  }

  function onOpenScoreSheet() {
    setShowScoreSheet(true);
    setIsSendMailModal(true);
  }

  function showSendMailModal() {
    setIsSendMailModal(false);
    setShowScoreSheet(true);
  }

  // // configure what to show
  // useEffect(() => {
  //   if (quiz?.accessibility?.live && quiz?.liveMode?.startingAt) {
  //     const isStarting = quiz?.liveMode?.isStarting;
  //     const isQuestion = quiz?.liveMode?.current;
  //     if (isQuestion) setIsQuizStarted(true)
  //    if (isStarting) {

  //     setIsLobby(false)
  //     setIsQuizStarted(true)

  //    }
  //   //  if (!isStarting && !isQuestion) {

  //   //  }

  //     // if (audio && !isStarting && !isQuestion) {
  //     //   audio.volume = 0.05;
  //     //   audio.play();
  //     // }
  //   }
  // }, [quiz]);

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

  return (
    <div className="w-full ">
      {type === "preview" && quiz && <PreviewDeletionGuard quiz={quiz} />}
      {type === "preview" && (
        <div className="w-[300px] bg-red-600 fixed z-[99999999] right-[-97px] top-[43px] rotate-45 transform  p-2 flex items-center justify-center">
          <span className="text-white font-semibold">Preview Mode</span>
        </div>
      )}
      {showScoreSheet ? (
        <>
          {isSendMailModal ? (
            <SendMailModal<TRefinedQuestion>
              close={showSendMailModal}
              id={id}
              quiz={quizResult}
              actualQuiz={quiz}
              //  isQuizResult={isQuizResult}
              setIsQuizResult={setIsQuizResult}
              isAttendee
              answers={answers}
              attendeeEmail={playerDetail?.email}
            />
          ) : (
            <ScoreBoard
              isAttendee
              answers={answers}
              close={() => {
                setShowScoreSheet(false);
                setIsYetToOnboard(true);
                if (audio) audio.pause();
              }}
              id={id}
              quiz={quizResult}
              isQuizResult={isQuizResult}
              setIsQuizResult={setIsQuizResult}
              actualQuiz={quiz}
              // onClose={showSendMailModal}
            />
          )}
        </>
      ) : (
        <>
          {isYetToOnboard && quiz && (
            <AttendeeOnboarding
              isAttendee
              id={id}
              chosenAvatar={chosenAvatar}
              setChosenAvatar={setChosenAvatar}
              setPlayerDetail={setPlayerDetail}
              playerDetail={playerDetail}
              setisLobby={setIsLobby}
              audio={audio}
              isLobby={isLobby}
              liveQuizPlayers={liveQuizPlayers}
              close={() => {
                setIsYetToOnboard(false);
                setIsQuizStarted(true);
                // show questions
              }}
              refetch={getData}
              refetchLobby={getLiveParticipant}
              organization={organization}
              quiz={quiz}
              
            />
          )}

          {isLobby && quiz && (
            <QuizLobby
              goBack={() => setIsLobby(false)}
              quiz={quiz}
              close={() => {
                setIsLobby(false);
                setIsQuizStarted(true);
              }}
              refetch={getData}
              isAttendee
              isMaxLiveParticipant={isMaxLiveParticipant}
              liveQuizPlayers={liveQuizPlayers}
              isLeftBox={false}
              onToggle={() => {}}
              refetchLobby={getLiveParticipant}
              id={id}
              className="rounded-lg"
            />
          )}
          {isQuizStarted && quiz && refinedQuizArray && (
            <QuestionView
              isLeftBox={false}
              answer={answer}
              quizAnswer={answers}
              getAnswer={getAnswer}
              refetchQuiz={getData}
              refetchQuizAnswers={getAnswers}
              quiz={refinedQuizArray}
              actualQuiz={quiz!}
              getLiveParticipant={getLiveParticipant}
              isRightBox={false}
              toggleRightBox={() => {}}
              toggleLeftBox={() => {}}
              onOpenScoreSheet={onOpenScoreSheet}
              updateQuiz={updateQuiz}
              updateQuizResult={updateQuizResult}
              quizParticipantId={id}
              isAttendee
              liveQuizPlayers={liveQuizPlayers}
              attendeeDetail={{
                attendeeId: null,
                attendeeName: playerDetail?.nickName,
                email: playerDetail?.email,
                phone: playerDetail?.phone,
                avatar: chosenAvatar!,
              }}
            />
          )}
        </>
      )}
      {quiz && quiz?.accessibility?.disable && (
        <div className="w-full h-[300px] flex flex-col bg-basePrimary-200 rounded-lg items-center justify-center">
          <InlineIcon icon="clarity:sad-face-line" fontSize={30} />
          <p className="font-medium text-base sm:text-lg">
            You don't have access to this quiz
          </p>
        </div>
      )}
    </div>
  );
}
