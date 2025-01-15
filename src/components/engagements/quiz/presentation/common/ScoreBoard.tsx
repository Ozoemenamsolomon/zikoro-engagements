"use client";

import { Button } from "@/components/custom";
import Image from "next/image";
import {
  TAnswer,
  TQuiz,
  TRefinedQuestion,
  TQuestion,
  TConnectedUser,
  TLiveQuizParticipant,
} from "@/types/quiz";
import { useMemo, useState } from "react";
import { ArrowBackOutline } from "styled-icons/evaicons-outline";
import { cn } from "@/lib/utils";
import { CheckCircle } from "styled-icons/bootstrap";
import { CloseOutline } from "styled-icons/zondicons";
import Avatar from "react-nice-avatar";
import { AvatarFullConfig } from "react-nice-avatar";
import { ArrowUpwardOutline } from "styled-icons/evaicons-outline";
import { useDeleteRequest, usePostRequest } from "@/hooks/services/requests";

type TLeaderBoard = {
  quizParticipantId: string;
  attendeeName: string;
  image: Required<AvatarFullConfig>;
  totalScore: number;
  recentScore: number;
};

interface TParticipantScores {
  quizParticipantId: string;
  attendeeName: string;
  image: Required<AvatarFullConfig>;
  totalScore: number;
  recentScore: number;
  recentAt: Date;
}
export function ScoreBoard({
  answers,
  close,
  quiz,
  id,
  isAttendee,
  actualQuiz,
}: {
  answers: TAnswer[];
  close: () => void;
  quiz: TQuiz<TRefinedQuestion[]> | null;
  id: string;
  isAttendee?: boolean;
  actualQuiz: TQuiz<TQuestion[]> | null;
}) {
  const [isQuizResult, setQuizResult] = useState(false);
  const { postData: updateQuiz, isLoading } =
    usePostRequest("engagements/quiz");
  const { deleteData: deleteQuizLobby } = useDeleteRequest<
    TLiveQuizParticipant[]
  >(`engagements/quiz/participant/${actualQuiz?.quizAlias}`);

  const board = useMemo(() => {
    const participantGroup: { [key: string]: TParticipantScores } = {};
    if (Array.isArray(answers) && answers.length > 0) {
      const filteredAnswers = answers?.filter((item) => {
        const quizStart = new Date(actualQuiz?.liveMode?.startingAt).getTime();
        const answerCreated = new Date(item?.created_at).getTime();
        const isQuizLive = actualQuiz?.accessibility?.live;
        if (isQuizLive) {
          return answerCreated > quizStart;
        } else {
          return true;
        }
      });
      filteredAnswers?.forEach((ans) => {
        const key = ans?.quizParticipantId;
        const createdAt = new Date(ans?.created_at);
        if (!participantGroup[key]) {
          participantGroup[key] = {
            quizParticipantId: ans?.quizParticipantId,
            attendeeName: ans?.attendeeName,
            image: ans?.avatar,
            recentAt: createdAt,
            recentScore: Number(ans?.attendeePoints),
            totalScore: 0,
          };
        }
        participantGroup[key].totalScore += Number(ans?.attendeePoints);

        if (createdAt > participantGroup[key].recentAt) {
          participantGroup[key].recentScore = Number(ans?.attendeePoints);
          participantGroup[key].recentAt = createdAt;
        }
      });

      const result: TLeaderBoard[] = Object.entries(participantGroup).map(
        ([quizParticipantId, data]) => ({
          quizParticipantId: data?.quizParticipantId,
          attendeeName: data?.attendeeName,
          image: data?.image,
          recentScore: Number(data?.recentScore),
          totalScore: data?.totalScore,
        })
      );

      const data = result.sort((a, b) => {
        return b?.totalScore - a?.totalScore;
      });

      return data;
    } else {
      return [];
    }
  }, [answers]);

  function onClose() {
    setQuizResult((prev) => !prev);
  }

  // console.log("quizresult", quiz);

  const userPosition = useMemo(() => {
    if (isAttendee && actualQuiz) {
      const playerId = id;
      const index = board?.findIndex(
        ({ quizParticipantId }) => quizParticipantId === playerId
      );

      return index + 1;
    }
  }, [board]);
  const userScore = useMemo(() => {
    if (isAttendee && actualQuiz) {
      const playerId = id;
      const score = board?.find(
        ({ quizParticipantId }) => quizParticipantId === playerId
      );

      return score?.totalScore || 0;
    }
  }, [board]);

  async function endLiveQuiz() {
    if (actualQuiz) {
      const payload = {
        ...actualQuiz,
        liveMode: {
          isEnded: null,
        },
      };
      await updateQuiz({ payload });
      await deleteQuizLobby();

      close();
    }
    window.location.reload();
  }

  return (
    <>
      {isQuizResult && quiz ? (
        <AttendeeScore
          quiz={quiz}
          close={onClose}
          id={id}
          userPosition={userPosition}
          userScore={userScore}
        />
      ) : (
        <div className="w-full inset-0 fixed overflow-x-auto h-full ">
          <div className="absolute inset-x-0  mx-auto px-4 w-full max-w-3xl mt-8">
            <h2 className="w-full  text-center mb-3 font-semibold text-lg sm:text-2xl">
              LeaderBoard
            </h2>

            <div className="mx-auto w-fit flex px-2 mb-6 items-center gap-x-8 sm:gap-x-20 bg-white h-10 rounded-3xl">
              <Button
                disabled={isLoading}
                onClick={endLiveQuiz}
                className="underline rounded-none px-2 h-10 w-fit"
              >
                Go To Quiz Page
              </Button>
              {isAttendee && quiz?.accessibility?.showResult && (
                <Button
                  onClick={onClose}
                  className="underline rounded-none px-2 h-10 w-fit"
                >
                  View Quiz Result
                </Button>
              )}
            </div>

            <div className="mx-auto w-full relative">
              {Array.isArray(board) && board?.length > 0 && (
                <div className=" flex w-full justify-center text-sm">
                  <div
                    className={cn(
                      "flex invisible flex-col relative left-11  mt-8 gap-y-4 justify-center",
                      board[1]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col mr-11 items-center justify-center gap-y-2">
                      {/*  <Image
                        src="/quizattendee.png"
                        className="w-[5rem]  h-[5rem]"
                        alt=""
                        width={150}
                        height={150}
                      />*/}
                      <Avatar
                        shape="circle"
                        className="w-[5rem]  h-[5rem]"
                        {...board[1]?.image}
                      />
                      <p className="text-white font-medium">
                        {board[1]?.attendeeName ?? ""}
                      </p>
                    </div>

                    <div className="w-[11.2rem]  relative h-fit">
                      <Image
                        src="/secondp.png"
                        className="w-[11.2rem]  object-cover"
                        alt=""
                        width={150}
                        height={500}
                      />
                      <div className="absolute mr-11 inset-x-0 top-10 text-white mx-auto flex flex-col items-center justify-center">
                        <p className="font-medium">2nd</p>
                        <p className="text-tiny bg-white/20 rounded-3xl px-3 py-1">{`${
                          board[1]?.totalScore?.toFixed(0) ?? 0
                        }p`}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex flex-col relative z-30 gap-y-4 justify-center invisible",
                      board[0]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-y-2">
                      {/*   <Image
                        src="/quizattendee.png"
                        className="w-[5rem] h-[5rem]"
                        alt=""
                        width={150}
                        height={150}
                      />*/}
                      <Avatar
                        shape="circle"
                        className="w-[5rem] h-[5rem]"
                        {...board[0]?.image}
                      />
                      <p className="text-white font-medium text-sm">
                        {board[0]?.attendeeName ?? ""}
                      </p>
                    </div>

                    <div className="w-[11.2rem]  relative h-fit">
                      <Image
                        src="/firstp.png"
                        className="w-[11.2rem] object-cover"
                        alt=""
                        width={150}
                        height={500}
                      />
                      <div className="absolute inset-x-0 top-10 text-white mx-auto flex flex-col items-center justify-center">
                        <p className="font-medium text-sm">1st</p>
                        <p className="text-tiny bg-white/20 rounded-3xl px-3 py-1">{`${
                          board[0]?.totalScore.toFixed(0) ?? 0
                        }p`}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex flex-col relative right-11 mt-10 gap-y-4 justify-center invisible",
                      board[2]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col ml-11 items-center justify-center gap-y-2">
                      {/*  <Image
                        src="/quizattendee.png"
                        className="w-[5rem] h-[5rem]"
                        alt=""
                        width={150}
                        height={150}
                      />*/}
                      <Avatar
                        shape="circle"
                        className="w-[5rem] h-[5rem]"
                        {...board[2]?.image}
                      />
                      <p className="text-white font-medium">
                        {board[2]?.attendeeName ?? ""}
                      </p>
                    </div>

                    <div className="w-[11.2rem] relative h-fit">
                      <Image
                        src="/thirdp.png"
                        className="w-[11.2rem] object-cover"
                        alt=""
                        width={150}
                        height={500}
                      />
                      <div className="absolute inset-x-0 ml-11 top-10 text-white mx-auto flex flex-col items-center justify-center">
                        <p className="font-medium">3rd</p>
                        <p className="text-tiny bg-white/20 rounded-3xl px-3 py-1">{`${
                          board[2]?.totalScore.toFixed(0) ?? 0
                        }p`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/** */}

              <div className="w-full overflow-y-auto pb-20 no-scrollbar z-50 bg-white absolute inset-x-0 h-full top-80 rounded-t-lg py-6 px-8">
                <div className="w-full flex flex-col items-start justify-start">
                  {Array.isArray(board) &&
                    board.slice(3, board?.length).map((player, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center w-full py-3 border-b px-2"
                      >
                        <div className="flex items-center col-span-2 gap-x-3">
                          <div className="flex flex-col items-center justify-center">
                            {/* <Image
                              src="/quizattendee.png"
                              className="w-[4rem] h-[4rem]"
                              alt=""
                              width={150}
                              height={150}
                            />*/}
                            <Avatar
                              shape="circle"
                              className="w-[4rem] h-[4rem]"
                              {...player?.image}
                            />
                            <p>{`${index + 4}th`}</p>
                          </div>
                          <p className="">{player?.attendeeName}</p>
                        </div>
                        <div className="flex items-center justify-end gap-x-1">
                          <p className="flex items-center">
                            <span>
                              {Number(player?.totalScore ?? 0).toFixed(0)}
                            </span>
                            p
                          </p>
                          {player?.recentScore > 0 && (
                            <div className="flex text-white bg-basePrimary rounded-3xl px-2 py-1 items-center gap-x-1 text-xs">
                              <ArrowUpwardOutline size={15} />
                              <p>{Number(player?.recentScore)?.toFixed(0)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AttendeeScore({
  userPosition,
  quiz,
  id,
  close,
  userScore,
}: {
  userPosition?: number;
  id: string;
  quiz: TQuiz<TRefinedQuestion[]>;
  close: () => void;
  userScore?: number;
}) {
  const [isAnswers, setIsAnswer] = useState(false);

  function showAnswers() {
    setIsAnswer((prev) => !prev);
  }

  return (
    <div className="w-full h-full inset-0 fixed overflow-y-auto bg-gray-100">
      {isAnswers ? (
        <AnswerSheet quiz={quiz} close={showAnswers} />
      ) : (
        <div className="bg-white rounded-lg p-4 absolute inset-0 m-auto h-fit max-w-2xl flex flex-col items-center gap-y-6">
          <Button
            onClick={close}
            className="gap-x-1 self-start w-fit h-fit px-2"
          >
            <ArrowBackOutline size={20} />
            <p className="text-sm">Back</p>
          </Button>
          <Image
            src={quiz?.coverImage || "/quiztime.png"}
            alt="cover-image"
            className="w-full h-[250px] object-cover"
            width={2000}
            height={1000}
          />

          <div className="flex flex-col mb-4 items-center justify-center gap-y-3 w-full">
            <h2 className="font-semibold text-base sm:text-2xl">
              {quiz?.coverTitle ?? ""}
            </h2>
            <div className="mx-auto w-[60%] my-6 flex items-center justify-between">
              <p>
                Points won:{" "}
                <span className="font-medium">
                  {userScore?.toFixed(0) ?? ""}
                </span>
              </p>
              <p>
                Position:{" "}
                <span className="font-medium">{userPosition ?? ""}</span>
              </p>
            </div>
          </div>

          <button onClick={showAnswers} className="mb-10 underline">
            View Quiz Scores
          </button>
        </div>
      )}
    </div>
  );
}

function AnswerSheet({
  quiz,
  close,
}: {
  quiz: TQuiz<TRefinedQuestion[]>;
  close: () => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  function toggleExplanationVisibility() {
    setShowExplanation((prev) => !prev);
  }
  const optionLetter = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-3xl absolute top-0 mx-auto inset-x-0 bg-white p-4">
      <Button onClick={close} className="gap-x-1 self-start w-fit h-fit px-2">
        <ArrowBackOutline size={20} />
        <p className="text-sm">Back</p>
      </Button>

      <div className="W-full max-w-xl mx-auto mt-8 flex gap-y-3 flex-col items-start justify-start">
        {Array.isArray(quiz?.questions) &&
          quiz?.questions?.map((question, index) => {
            // correct answer index
            const correctAnswerIndex = question?.options?.findIndex(
              ({ isAnswer }) => isAnswer !== ""
            );
            // chosen answer index
            const chosenAsnwerIndex = question?.options?.findIndex(
              ({ isCorrect }) => typeof isCorrect === "boolean"
            );
            // chosen answer
            const chosenAnswer = question?.options?.find(
              ({ isCorrect }) => typeof isCorrect === "boolean"
            );

            return (
              <div className="w-full space-y-3 ">
                <h2>{`Question ${index + 1}`}</h2>

                <div
                  className="innerhtml w-full"
                  dangerouslySetInnerHTML={{
                    __html: question?.question ?? "",
                  }}
                />
                {question?.questionImage && (
                  <Image
                    className="w-full h-40 "
                    src={question?.questionImage}
                    width={700}
                    height={300}
                    alt=""
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {question?.options.map((option, index) => (
                    <div className="w-full flex items-center gap-x-2">
                      <p>{`${optionLetter[index]}.`}</p>
                      <p
                        className=""
                        dangerouslySetInnerHTML={{
                          __html: option?.option ?? "",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-full flex flex-col gap-y-1 items-start justify-start">
                  <div
                    className={cn(
                      "text-white font-medium bg-red-500 w-full px-2 py-3 flex items-center justify-between",
                      typeof chosenAnswer?.isCorrect === "boolean" &&
                        chosenAnswer?.isCorrect &&
                        "bg-green-500"
                    )}
                  >
                    <p>Your Answer</p>
                    <div className="flex items-center gap-x-2">
                      {typeof chosenAnswer?.isCorrect === "boolean" &&
                      chosenAnswer?.isCorrect ? (
                        <CheckCircle size={22} />
                      ) : (
                        <CloseOutline size={22} />
                      )}
                      <p>{optionLetter[chosenAsnwerIndex]}</p>
                    </div>
                  </div>
                  <div className="text-white font-medium bg-green-500 w-full px-2 py-3 flex items-center justify-between">
                    <p>Correct Answer</p>
                    <div className="flex items-center gap-x-2">
                      <CheckCircle size={22} />

                      <p>{optionLetter[correctAnswerIndex]}</p>
                    </div>
                  </div>
                </div>

                {showExplanation && (
                  <p className="mb-3 text-xs sm:text-sm text-gray-500">
                    {question?.feedBack ?? "No Explanation"}
                  </p>
                )}

                <button
                  onClick={toggleExplanationVisibility}
                  className="text-xs sm:text-sm text-basePrimary underline"
                >
                  {showExplanation ? "Hide Explanation" : "Show Explanation"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
