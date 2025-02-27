"use client";

import { cn } from "@/lib/utils";
import { LobbyHeader } from "./LobbyHeader";
import {
  TLiveQuizParticipant,
  TQuestion,
  TQuiz,
  TQuizParticipant,
} from "@/types/quiz";
import Avatar, { AvatarFullConfig } from "react-nice-avatar";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useDeleteRequest, usePostRequest } from "@/hooks/services/requests";
import { Maximize2 } from "styled-icons/feather";
import { Button } from "@/components/custom";
import Link from "next/link";
function WaitingPlayer({
  nickName,
  avatar,
}: {
  nickName: string;
  avatar: Required<AvatarFullConfig>;
}) {
  return (
    <div className="w-16 quiz-lobby swipeDown flex flex-col gap-1 items-center justify-center h-[80px]">
      <Avatar
        shape="square"
        style={{ borderRadius: "12px" }}
        className="w-16 h-16"
        {...avatar}
      />
      <p className="w-full capitalize line-clamp-1 text-xs sm:text-mobile font-medium">
        {nickName}
      </p>
    </div>
  );
}

export type QuizLobbyRef = {
  openQuestion: () => Promise<void>;
  loading: boolean;
};

type QuizLobbyProp = {
  isAttendee?: boolean;
  className?: string;
  close: () => void;
  goBack: () => void;
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
  liveQuizPlayers: TLiveQuizParticipant[];
  isMaxLiveParticipant: boolean;
  onToggle: () => void;
  isLeftBox: boolean;
  refetchLobby?: () => Promise<any>;
  id: string;
};

export const QuizLobby = forwardRef<QuizLobbyRef, QuizLobbyProp>(
  (
    {
      isAttendee,
      className,
      quiz,
      close,
      goBack,
      refetch,
      liveQuizPlayers,
      isMaxLiveParticipant,
      onToggle,
      refetchLobby,
      id,
    }: QuizLobbyProp,
    ref
  ) => {
    const [loading, setLoading] = useState(false);
    const { postData } =
      usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
    const { isLoading, deleteData } = useDeleteRequest<TLiveQuizParticipant[]>(
      `engagements/quiz/participant/${quiz?.quizAlias}`
    );
    const [players, setPlayers] = useState<TQuizParticipant[]>([]);

    useImperativeHandle(ref, () => ({
      openQuestion,
      loading,
    }));

    useEffect(() => {
      (() => {
        if (Array.isArray(liveQuizPlayers) && liveQuizPlayers?.length > 0) {
          /**
         const filtered = liveQuizPlayers?.filter(
          (participant) =>
            new Date(participant?.joinedAt).getTime() >
            new Date(quiz?.liveMode?.startingAt).getTime()
        );
        */

          const mappedPlayers = liveQuizPlayers?.map((player) => {
            const { quizAlias, ...rest } = player;
            return {
              ...rest,
              id: player?.quizParticipantId,
            };
          });

          setPlayers(mappedPlayers);
        }
      })();
    }, [liveQuizPlayers]);

    // for an attendee
    useEffect(() => {
      if (isAttendee && quiz?.liveMode?.isStarting) {
        close();
      }
      // check if quiz has started and user is in the lobby , and has been admitted
      if (
        isAttendee &&
        quiz?.quizParticipants?.some((participant) => {
          return participant.id === id;
        })
      ) {
        close();
      }
    }, [quiz]);

    async function openQuestion() {
      setLoading(true);
      const { startingAt } = quiz?.liveMode;
      const payload: Partial<TQuiz<TQuestion[]>> = {
        ...quiz,
        liveMode: { startingAt, isStarting: true },
        quizParticipants:
          quiz?.quizParticipants && quiz?.quizParticipants?.length > 0
            ? [...quiz?.quizParticipants, ...players]
            : [...players],
      };
      console.log("payload", payload);
      await postData({ payload });
      await deleteData();
      refetch();
      refetchLobby?.();

      setLoading(false);
      close();
    }

    return (
      <div
        className={cn(
          "w-[95%] px-4  inset-0  bg-white text-sm h-[75vh] m-auto absolute",
          className
        )}
      >
        <LobbyHeader
          isAttendee={isAttendee}
          isMaxReached={isMaxLiveParticipant}
          noOfParticipants={String(players?.length)}
          isLive={quiz?.accessibility?.live}
          coverTitle={quiz?.coverTitle ?? ""}
        />
        <div className="w-full flex flex-wrap p-4 sm:p-6 items-start gap-4">
          {players?.map((player) => (
            <WaitingPlayer
              key={player?.id}
              nickName={player?.nickName ?? ""}
              avatar={player?.participantImage}
            />
          ))}

          {!isAttendee && (
            <Button
              className="absolute left-3 bottom-3"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <Maximize2 size={22} />
            </Button>
          )}
        </div>
        {quiz.branding.poweredBy && (
          <Link
            href="/home"
            className="text-center absolute mx-auto w-fit inset-x-0 bottom-3 p-3"
          >
            Create your {quiz?.interactionType === "quiz" ? "Quiz" : "Poll"}{" "}
            with Zikoro
          </Link>
        )}
      </div>
    );
  }
);
