"use client";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import { useState, useMemo, useEffect } from "react";
import { TLiveQuizParticipant, TQuestion, TQuiz } from "@/types/quiz";
import { useRouter, useSearchParams } from "next/navigation";
import { isAfter } from "date-fns";
import Image from "next/image";
import {toast} from "react-toastify";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus } from "styled-icons/bootstrap";
import { Button } from "@/components/custom";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { QuizLobby } from "../../common";
import { AvatarModal } from "./AvatarModal";
import { usePostRequest } from "@/hooks/services/requests";
import { TOrganization } from "@/types/home";
import { useRealtimePresence } from "@/hooks/services/quiz";

export type TPlayerDetail = {
  phone: string;
  email: string;
  nickName: string;
};
export function AttendeeOnboarding({
  close,
  refetch,
  id,
  playerDetail,
  setPlayerDetail,
  isLobby,
  setisLobby,
  attendeeId,
  chosenAvatar,
  setChosenAvatar,
  audio,
  quiz,
  liveQuizPlayers,
  refetchLobby,
  organization,
  isAttendee,
}: {
  close: () => void;
  organization: TOrganization;
  refetch: () => Promise<any>;
  isAttendee: boolean;
  id: string;
  playerDetail: TPlayerDetail;
  refetchLobby?: () => Promise<any>;
  setPlayerDetail: React.Dispatch<React.SetStateAction<TPlayerDetail>>;
  isLobby: boolean;
  setisLobby: React.Dispatch<React.SetStateAction<boolean>>;
  attendeeId?: number;
  chosenAvatar: Required<AvatarFullConfig> | null;
  setChosenAvatar: React.Dispatch<
    React.SetStateAction<Required<AvatarFullConfig> | null>
  >;
  audio?: HTMLAudioElement | null;
  quiz: TQuiz<TQuestion[]>;
  liveQuizPlayers: TLiveQuizParticipant[];
}) {
  const { postData: updateQuiz } = usePostRequest("engagements/quiz");
  const params = useSearchParams();
  const query = params.get("redirect");
  const respAlias = params.get("responseAlias");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isLoading, postData: addLiveParticipant } =
    usePostRequest<TLiveQuizParticipant>(`engagements/quiz/participant`);
  const [isAvatarModal, setAvatarModal] = useState(false);
  useRealtimePresence(quiz?.accessibility?.live);
  const [isAvatar, setIsAvatar] = useState(false);

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

  // useEffect(() => {
  //   if (quiz && isAttendee && !query) {
  //     if (quiz?.formAlias) {
  //       router.push(
  //         `/engagements/${quiz?.eventAlias}/form/${quiz?.formAlias}?redirect=quiz&id=${id}&link=${window.location.href}`
  //       );
  //     }
  //   }
  // }, [quiz]);

  function generateAvatars() {
    const avatars = Array.from({ length: 10 }).map((_, index) => {
      return {
        avatar: genConfig(),
      };
    });

    return avatars;
  }
  function toggleIsAvatar() {
    setIsAvatar((prev) => !prev);
  }

  const avatars = useMemo(() => {
    return generateAvatars();
  }, [isAvatar]);

  function toggleAvatarModal() {
    setAvatarModal((prev) => !prev);
  }
  // player start quiz
  async function submit(e: any) {
    e.preventDefault();
    console.log(playerDetail)
    if (!playerDetail?.nickName) {
      toast.error("Pls add a nickName");
      return;
    }
    if (chosenAvatar === null) {
      toast.error("Pls select an avatar");
      return;
    }

    if (quiz?.accessibility?.visible && playerDetail?.email?.length === 0) {
      toast.error("You have to add ur email address");
      return;
    }

    const isAttemptedQuiz = quiz?.quizParticipants?.some((participant) =>
      Number(attendeeId)
    );
    if (isAttendee && isAttemptedQuiz) {
      return toast.error("You have already attempted this quiz");
    }

    setLoading(true);
    if (quiz?.accessibility?.live) {
      const payload: TLiveQuizParticipant = {
        ...playerDetail,
        quizAlias: quiz?.quizAlias,
        quizParticipantId: id,

        joinedAt: new Date().toISOString(),
        participantImage: chosenAvatar,
        formResponseAlias: respAlias,
      };

      await addLiveParticipant({ payload });
    } else {
      const payload: Partial<TQuiz<TQuestion[]>> = {
        ...quiz,
        quizParticipants: quiz?.quizParticipants
          ? [
              ...quiz?.quizParticipants,
              {
                ...playerDetail,
                id: id,

                joinedAt: new Date().toISOString(),
                participantImage: chosenAvatar,
                formResponseAlias: respAlias,
              },
            ]
          : [
              {
                ...playerDetail,
                id: id,

                joinedAt: new Date().toISOString(),
                participantImage: chosenAvatar,
                formResponseAlias: respAlias,
              },
            ],
      };
      await updateQuiz({ payload });
    }

    //  saveCookie("currentPlayer", { id });

    await refetch();
    await refetchLobby?.();
    if (quiz?.accessibility?.live) {
      await refetchLobby?.();
      setisLobby(true);
    } else {
      close();
    }
    setLoading(false);
  }

 

  // useEffect(() => {
  //   if (!quiz?.liveMode?.startingAt) return;
  //   const currentTime = new Date();
  //   const quizStartingTime = new Date(quiz?.liveMode?.startingAt);
  //   let interval = setInterval(() => {
  //     if (isLobby && isAfter(currentTime, quizStartingTime)) {
  //       refetch();
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 2000);
  // }, []);

  // show the lobby if organizer has already started the quiz
  useEffect(() => {
    if (
      !isAttendee &&
      quiz?.accessibility?.live &&
      quiz?.liveMode?.startingAt
    ) {
      setisLobby(true);
      if (audio) {
        audio.volume = 0.05;
        audio.play();
      }
    }
  }, [isAttendee]);

  return (
    <>
      <form
        onSubmit={submit}
        className={cn(
          "w-full text-sm p-4 gap-y-6 animate-float-in col-span-full flex flex-col h-fit absolute inset-0  justify-center items-center m-auto max-w-3xl rounded-lg",
          isLobby && "hidden"
        )}
      >
        <Image
          src={quiz?.coverImage || "/quiztime.png"}
          alt="cover-image"
          className="w-full h-[200px] object-cover"
          width={2000}
          height={1000}
        />

        <div className="flex flex-col mb-4 items-center justify-center gap-y-3 w-full">
          <h2 className="font-semibold text-base sm:text-2xl">
            {quiz?.coverTitle ?? ""}
          </h2>
          <p className="text-center line-clamp-3">{quiz?.description ?? ""}</p>
        </div>

        <div
          className={cn(
            "w-full flex justify-center items-end gap-x-2",
            (quiz.accessibility?.isCollectEmail ||
              quiz.accessibility?.isCollectEmail) &&
              "items-start"
          )}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleAvatarModal();
            }}
            className="text-basePrimary rounded-lg h-16 w-16 flex items-center justify-center border flex-col"
          >
            {chosenAvatar ? (
              <Avatar style={{borderRadius: "12px"}} shape="square" className="h-16 w-16 rounded-lg" {...chosenAvatar} />
            ) : (
              <>
                <Plus size={24} className="" />
                <p className="text-xs text-gray-600 font-medium">Avatar</p>
              </>
            )}
          </button>
          <div className="w-[70%] max-w-[26em] space-y-2">
            <Input
              value={playerDetail?.nickName}
              onChange={(e) => {
                setPlayerDetail({
                  ...playerDetail,
                  nickName: e.target.value,
                });
              }}
              className="border-0 border-b bg-transparent rounded-none w-full"
              placeholder="Enter Nickame"
              type="text"
            />
            {(quiz.accessibility?.isCollectEmail ||
              quiz.accessibility?.isCollectEmail) && (
              <Input
                value={
                  quiz.accessibility?.isCollectEmail
                    ? playerDetail?.email
                    : playerDetail?.phone
                }
                onChange={(e) => {
                  setPlayerDetail({
                    ...playerDetail,
                    [quiz.accessibility?.isCollectEmail ? "email" : "phone"]:
                      e.target.value,
                  });
                }}
                className="border-0 border-b rounded-none w-full"
                placeholder={
                  quiz.accessibility?.isCollectEmail
                    ? "Enter Email Address"
                    : "Enter Phone Number"
                }
                type={quiz.accessibility?.isCollectEmail ? "email" : "tel"}
              />
            )}
            {quiz?.interactionType !== "poll" && (
              <>
                {(quiz.accessibility?.isCollectEmail ||
                  quiz.accessibility?.isCollectEmail) && (
                  <div className="w-full  text-xs">
                    <p className="w-full text-gray-600 text-center">
                      {`${
                        quiz.accessibility?.isCollectEmail
                          ? "Email"
                          : "Phone Number"
                      } is required for this game to store your points and
                    possible follow-up should you appear on the leaderboard.`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Button
          disabled={loading}
          // onClick={submit}
          className="bg-basePrimary gap-x-2 px-10 h-12 rounded-lg text-gray-50 transform transition-all duration-400 "
        >
          {loading && <LoaderAlt size={22} className="animate-spin" />}
          <p> Let's Go</p>
        </Button>
      </form>

      {isAvatarModal && (
        <AvatarModal
          close={toggleAvatarModal}
          chosenAvatar={chosenAvatar}
          setChosenAvatar={setChosenAvatar}
          toggleIsAvatar={toggleIsAvatar}
          avatars={avatars}
        />
      )}
    </>
  );
}
