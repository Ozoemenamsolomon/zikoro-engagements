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
import { useEffect, useState } from "react";
import { useDeleteRequest, usePostRequest } from "@/hooks/services/requests";
import { Maximize2 } from "styled-icons/feather";
import { Button } from "@/components/custom";
function WaitingPlayer({
  nickName,
  avatar,
}: {
  nickName: string;
  avatar: Required<AvatarFullConfig>;
}) {
  return (
    <div className="w-[60px] quiz-lobby swipeDown flex flex-col items-center justify-center h-[80px]">
      <Avatar shape="square" className="w-[60px] h-[60px]" {...avatar} />
      <p className="w-full line-clamp-1 text-xs sm:text-mobile font-medium">
        {nickName}
      </p>
    </div>
  );
}

export function QuizLobby({
  isAttendee,
  className,
  quiz,
  close,
  goBack,
  refetch,
  liveQuizPlayers,
  isMaxLiveParticipant,
  onToggle,
  isLeftBox,
  refetchLobby,
  id,
}: {
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
}) {
  const [loading, setLoading] = useState(false);
  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const { isLoading, deleteData } = useDeleteRequest<TLiveQuizParticipant[]>(
    `engagements/quiz/participant/${quiz?.quizAlias}`
  );
  const [players, setPlayers] = useState<TQuizParticipant[]>([]);

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
        "w-full px-4 inset-0 text-sm h-[75vh] m-auto absolute",
        className
      )}
    >
      <LobbyHeader
        isAttendee={isAttendee}
        isMaxReached={isMaxLiveParticipant}
        noOfParticipants={String(players?.length)}
        isLive={false}
        coverTitle={quiz?.coverTitle ?? ""}
      />
      <div className="w-full flex flex-wrap items-start gap-4">
        {players?.map((player) => (
          <WaitingPlayer
            key={player?.id}
            nickName={player?.nickName ?? ""}
            avatar={player?.participantImage}
          />
        ))}

{!isLeftBox &&  <Button
       className="absolute left-3 bottom-3"
       onClick={(e) => {
        e.stopPropagation()
        onToggle()
       }}
       >
        <Maximize2 size={22}/>
       </Button>}
      </div>
      {quiz.branding.poweredBy && (
          <p className="text-center p-3">Powered by Zikoro</p>
        )}
    </div>
  );
}
