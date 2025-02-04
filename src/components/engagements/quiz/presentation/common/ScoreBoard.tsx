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
  TExportedAnswer,
} from "@/types/quiz";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Avatar, { AvatarFullConfig } from "react-nice-avatar";
import * as XLSX from "xlsx";
import { useDeleteRequest, usePostRequest } from "@/hooks/services/requests";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { formatPosition } from "@/utils";
import { ActionModal } from "@/components/custom/ActionModal";
import { useRouter } from "next/navigation";

type TLeaderBoard = {
  quizParticipantId: string;
  attendeeName: string;
  image: Required<AvatarFullConfig>;
  totalScore: number;
  recentScore: number;
  answeredQuestion: TRefinedQuestion[];
};

interface TParticipantScores {
  quizParticipantId: string;
  attendeeName: string;
  image: Required<AvatarFullConfig>;
  totalScore: number;
  recentScore: number;
  recentAt: Date;
  answeredQuestion: TRefinedQuestion[];
}

function PlayerRankWidget({
  player,
  id,
  isSelected,
  className,
  position,
}: {
  id?: string;
  player: TLeaderBoard;
  isSelected?: boolean;
  position: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 px-8 items-center w-full py-3 border-b ",
        player.quizParticipantId === id && "bg-basePrimary-200",
        className
      )}
    >
      <div className="flex items-center col-span-2 gap-x-3">
        <p>{position}</p>
        <div className="w-fit ml-10 h-fit relative">
          <Avatar
            shape="square"
            style={{ borderRadius: "12px" }}
            className="w-[3rem]  h-[3rem]"
            {...player?.image}
          />
          {player?.quizParticipantId === id && (
            <span className="absolute top-[-2px] right-0 text-white bg-basePrimary rounded-3xl p-1 text-xs">
              You
            </span>
          )}
        </div>

        <p className="">{player?.attendeeName}</p>
      </div>
      <div className="flex items-center justify-center gap-x-2">
        <p className="flex items-center">
          <span>{Number(player?.totalScore ?? 0).toFixed(0)} pt</span>
        </p>
        {isSelected && (
          <InlineIcon icon="iconamoon:arrow-down-2-thin" fontSize={20} />
        )}
      </div>
    </div>
  );
}

export function ScoreBoard({
  answers,
  close,
  quiz,
  id,
  isAttendee,
  isQuizResult,
  actualQuiz,
  setIsQuizResult,
}: {
  answers: TAnswer[];
  close: () => void;
  quiz: TQuiz<TRefinedQuestion[]> | null;
  id: string;
  isAttendee?: boolean;
  actualQuiz: TQuiz<TQuestion[]> | null;
  isQuizResult?: boolean;
  setIsQuizResult?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isAdminAction, setIsAdminAction] = useState(false);
  const { deleteData } = useDeleteRequest(
    `engagements/quiz/answer/${actualQuiz?.quizAlias}`
  );
  const [isExport, setIsExport] = useState(false);
  const router = useRouter();
  const [isViewIndResult, setIsViewIndResult] = useState(false);
  const { postData: updateQuiz, isLoading } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const { deleteData: deleteQuizLobby } = useDeleteRequest<
    TLiveQuizParticipant[]
  >(`engagements/quiz/participant/${actualQuiz?.quizAlias}`);
  const [isToClear, setIsToClear] = useState(false);
  const [isLoadingClear, setIsLoadingClear] = useState(false);

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
            answeredQuestion: [],
          };
        }
        participantGroup[key].totalScore += Number(ans?.attendeePoints);

        participantGroup[key].answeredQuestion = [
          ...participantGroup[key].answeredQuestion,
          ans?.answeredQuestion,
        ];

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
          answeredQuestion: data?.answeredQuestion,
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

  function onClose() {}

  function onToggleIndResult() {
    setIsViewIndResult((prev) => !prev);
  }

  function toggleIExport() {
    setIsExport((prev) => !prev);
  }

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

  const userAvatar = useMemo(() => {
    if (isAttendee) {
      const playerId = id;
      return board?.find(
        ({ quizParticipantId, image }) => quizParticipantId === playerId
      )?.image;
    }
  }, [board]);


  // handle delete lobby
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (actualQuiz) {
        const payload = {
          ...actualQuiz,
          liveMode: {
            isEnded: null,
          },
        };
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/engagements/quiz", blob);
        navigator.sendBeacon(
          `/api/engagements/quiz/participant/${actualQuiz?.quizAlias}`
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quiz]);

  function onToggleClear() {
    setIsToClear((prev) => !prev);
  }

  // clear record
  async function clearRecord() {
    setIsLoadingClear(true);

    // delete all answers for a quiz
    await deleteData();

    // delete all the participant for a quiz
    await updateQuiz({
      payload: {
        ...actualQuiz,
        quizParticipants: [],
      },
    });

    setIsLoadingClear(false);
    onToggleClear();
  }

  async function exportAsCSV() {
    const exportedAnswer: TExportedAnswer[] = answers?.map((answer) => {
      const {
        answeredQuestion,
        questionId,
        avatar,
        correctOptionId,
        selectedOptionId,
        quizAlias,
        ...rest
      } = answer;
      const actualQuestion = actualQuiz?.questions?.find(
        (v) => v?.id === questionId
      );
      return {
        ...rest,
        question: actualQuestion?.question!,
        selectedOption: actualQuestion?.options?.find(
          (v) => v?.optionId === selectedOptionId?.optionId
        )?.option,
      };
    });

    const filteredResult = exportedAnswer?.filter(Boolean);

    const worksheet = XLSX.utils.json_to_sheet(filteredResult);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Data");
    XLSX.writeFile(workbook, "quiz-answer.xlsx");
    toggleIExport();
  }

  return (
    <>
      {!isViewIndResult && (
        <>
          {isQuizResult && quiz ? (
            <AttendeeScore
              quiz={quiz}
              close={onClose}
              id={id}
              userPosition={userPosition}
              userScore={userScore}
              setIsQuizResult={setIsQuizResult}
              noOfParticipants={board.length}
              userAvatar={userAvatar}
              answers={answers}
            />
          ) : (
            <div className="w-full inset-0 fixed overflow-x-auto h-full ">
              {!isAttendee ? (
                <div className="w-full flex items-center p-3 justify-between">
                  <Button className=" gap-x-2 ">
                    <InlineIcon
                      fontSize={22}
                      icon="iconoir:leaderboard-star"
                      color="#9D00FF"
                    />
                    <p className="gradient-text bg-basePrimary">LeaderBoard</p>
                  </Button>

                  <div className="flex items-center rounded-lg  bg-basePrimary ">
                    <Button
                      onClick={onToggleIndResult}
                      className="flex items-center text-white  h-10 rounded-none border-r border-white gap-x-2"
                    >
                      <InlineIcon
                        icon="mdi:eye-outline"
                        fontSize={18}
                        color="#ffffff"
                      />
                      <p>View Individual Quiz Result</p>
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/e/${quiz?.workspaceAlias}/quiz/o/${quiz?.quizAlias}/analytics`
                        )
                      }
                      className="text-white h-10 gap-x-2 rounded-none border-r border-white"
                    >
                      <InlineIcon
                        icon="tabler:brand-google-analytics"
                        fontSize={18}
                        color="#ffffff"
                      />
                      <p>Analytics</p>
                    </Button>
                    <Button
                      onClick={() => setIsAdminAction(true)}
                      className="h-10 relative"
                    >
                      <InlineIcon
                        icon="mdi:dots-vertical"
                        fontSize={18}
                        color="#ffffff"
                      />
                      {isAdminAction && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-[3rem] left-[-8rem]"
                        >
                          <div
                            onClick={() => setIsAdminAction(false)}
                            className="w-screen h-screen fixed inset-0 bg-transparent"
                          ></div>
                          <div className="relative animate-float-in shadow h-fit bg-white w-fit py-3 rounded-lg ">
                            <div className="w-full flex flex-col items-start justify-start gap-2">
                              <Button
                                onClick={() => {
                                  toggleIExport();
                                  setIsAdminAction(false);
                                }}
                                className="flex items-center w-full rounded-none  h-10  gap-x-2"
                              >
                                <InlineIcon
                                  icon="carbon:export"
                                  fontSize={18}
                                  color="#000000"
                                />
                                <p>Export as CSV</p>
                              </Button>
                              <Button
                                onClick={() => {
                                  onToggleClear();
                                  setIsAdminAction(false);
                                }}
                                className="flex w-full items-center rounded-none h-10  gap-x-2"
                              >
                                <InlineIcon
                                  icon="mingcute:delete-line"
                                  fontSize={18}
                                  color="#000000"
                                />
                                <p>Delete Record</p>
                              </Button>
                      </div>
                          </div>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <h2 className="font-semibold text-base sm:text-lg text-center ">
                  LeaderBoard
                </h2>
              )}
              <div className="absolute inset-x-0  mx-auto px-4 w-full max-w-3xl mt-8">
                <div className="mx-auto w-full relative">
                  {Array.isArray(board) && board?.length > 0 && (
                    <div className=" flex w-full justify-center text-sm">
                      <div
                        className={cn(
                          "flex invisible flex-col relative left-11  mt-8 gap-y-4 justify-center",
                          board[1] && "visible"
                        )}
                      >
                        <div className="flex flex-col mr-11 items-center justify-center gap-y-2">
                          <Avatar
                            shape="square"
                            style={{ borderRadius: "12px" }}
                            className="w-[5rem]  h-[5rem]"
                            {...board[1]?.image}
                          />
                          {board[1].quizParticipantId === id ? (
                            <p className="bg-basePrimary rounded-3xl text-white px-2 py-1 font-medium text-mobile">
                              You
                            </p>
                          ) : (
                            <p className="text-zinc-700 text-sm font-medium">
                              {board[1]?.attendeeName ?? ""}
                            </p>
                          )}
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
                            <p className=" font-semibold text-lg">2</p>
                            <p className=" bg-white text-basePrimary font-medium rounded-3xl px-3 py-1">{`${
                              board[1]?.totalScore?.toFixed(0) ?? 0
                            } pt`}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col relative z-30 gap-y-4 mt-[-6rem] justify-center invisible",
                          board[0] && "visible"
                        )}
                      >
                        <div className="flex flex-col items-center justify-center gap-y-2">
                          <Avatar
                            shape="square"
                            style={{ borderRadius: "12px" }}
                            className="w-[5rem] h-[5rem]"
                            {...board[0]?.image}
                          />
                          {board[0]?.quizParticipantId === id ? (
                            <p className="bg-basePrimary text-white rounded-3xl px-2 py-1 font-medium text-mobile">
                              You
                            </p>
                          ) : (
                            <p className="text-zinc-700 font-medium text-sm">
                              {board[0]?.attendeeName ?? ""}
                            </p>
                          )}
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
                            <p className="font-semibold text-lg ">1</p>
                            <p className="font-medium bg-white text-basePrimary rounded-3xl px-3 py-1">{`${
                              board[0]?.totalScore.toFixed(0) ?? 0
                            } pt`}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col relative right-11 mt-10 gap-y-4 justify-center invisible",
                          board[2] && "visible"
                        )}
                      >
                        <div className="flex flex-col ml-11 items-center justify-center gap-y-2">
                          <Avatar
                            shape="square"
                            style={{ borderRadius: "12px" }}
                            className="w-[5rem] h-[5rem]"
                            {...board[2]?.image}
                          />
                          {board[2]?.quizParticipantId === id ? (
                            <p className="bg-basePrimary rounded-3xl text-white px-2 py-1 font-medium text-mobile">
                              You
                            </p>
                          ) : (
                            <p className="text-zinc-700 text-sm font-medium">
                              {board[2]?.attendeeName ?? ""}
                            </p>
                          )}
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
                            <p className="font-semibold text-lg">3</p>
                            <p className="font-medium bg-white text-basePrimary rounded-3xl px-3 py-1">{`${
                              board[2]?.totalScore.toFixed(0) ?? 0
                            } pt`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full overflow-y-auto pb-20 no-scrollbar z-50 bg-white absolute inset-x-0 h-full top-80 rounded-t-lg py-6 ">
                    {board.slice(3, board?.length).length > 0 && (
                      <div className="w-full px-8 text-sm pb-2 grid grid-cols-3">
                        <p>Rank</p>
                        <p>
                          Participants ({board.slice(3, board?.length).length})
                        </p>
                        <p className="text-end">Points</p>
                      </div>
                    )}
                    <div className="w-full flex flex-col items-start justify-start">
                      {Array.isArray(board) &&
                        board
                          .slice(3, board?.length)
                          .map((player, index) => (
                            <PlayerRankWidget
                              player={player}
                              key={index}
                              id={id}
                              position={formatPosition(index + 4)}
                            />
                          ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isViewIndResult && (
        <OrganizerSheet
          close={onToggleIndResult}
          answers={answers}
          quiz={actualQuiz}
          players={board}
        />
      )}

      {isExport && (
        <ActionModal
          close={toggleIExport}
          titleColor="bg-basePrimary gradient-text"
          title="Export"
          modalTitle="Export to CSV"
          modalText="Are you sure you want to continue?"
          asynAction={exportAsCSV}
          buttonText="Export"
          buttonColor="bg-basePrimary text-white"
        />
      )}

      {isToClear && (
        <ActionModal
          loading={isLoadingClear}
          close={onToggleClear}
          asynAction={clearRecord}
          buttonText="Delete"
          buttonColor="text-white bg-red-500"
          titleColor="text-red-500"
          modalTitle="Delete Quiz Record"
          title="Clear Record"
          modalText="Participants records, scores and points will be deleted and can not be recovered."
        />
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
  setIsQuizResult,
  userAvatar,
  noOfParticipants,
  answers,
}: {
  userPosition?: number;
  id: string;
  quiz: TQuiz<TRefinedQuestion[]>;
  close: () => void;
  userScore?: number;
  setIsQuizResult?: React.Dispatch<React.SetStateAction<boolean>>;
  userAvatar: Required<AvatarFullConfig> | undefined;
  noOfParticipants: number;
  answers: TAnswer[];
}) {
  const [isAnswers, setIsAnswer] = useState(false);

  function showAnswers() {
    setIsAnswer((prev) => !prev);
  }
  const correctAnswers = useMemo(() => {
    return quiz?.questions?.filter((item) =>
      item?.options.some(
        (opt) =>
          typeof opt?.isCorrect === "boolean" && opt.isAnswer === opt.optionId
      )
    )?.length;
  }, [quiz]);

  return (
    <div className="w-full h-full inset-0 fixed overflow-y-auto bg-basePrimary-100">
      {isAnswers ? (
        <AnswerSheet
          quiz={quiz}
          close={showAnswers}
          answer={answers}
          userAvatar={userAvatar}
        />
      ) : (
        <div className="max-w-2xl h-fit flex flex-col items-center justify-center absolute inset-0 m-auto w-[95%] ">
          <div className="bg-white rounded-lg  max-w-2xl w-full justify-center h-fit  flex flex-col items-center gap-y-4">
            <div className="w-full flex flex-col items-center justify-center p-4">
              <div className="flex  items-center w-fit gap-x-2 justify-center border-2 rounded-full p-2">
                <Avatar {...userAvatar} className="h-16 w-16" shape="circle" />
                <span className="font-semibold text-lg sm:text-xl">
                  {formatPosition(userPosition ?? 0)}
                </span>
              </div>
              <p className="text-center my-4">
                You ranked {formatPosition(userPosition ?? 0)} out of{" "}
                {noOfParticipants} participants
              </p>
            </div>

            <div className="w-full grid grid-cols-4 h-20 border-t">
              <AbouttAttendeeScore
                type="Points"
                metric={userScore ?? 0}
                Icon={
                  <InlineIcon
                    icon="solar:star-circle-bold-duotone"
                    fontSize={18}
                    color="#001fcc"
                  />
                }
              />
              <AbouttAttendeeScore
                type="Questions"
                className="border-x"
                metric={quiz?.questions?.length}
                Icon={
                  <InlineIcon
                    icon="line-md:question-circle-twotone"
                    fontSize={18}
                    color="#001fcc"
                  />
                }
              />
              <AbouttAttendeeScore
                type="Correct"
                metric={correctAnswers ?? 0}
                Icon={
                  <InlineIcon
                    icon="icon-park-twotone:correct"
                    fontSize={18}
                    color="#22c55e"
                  />
                }
                className="border-r"
              />
              <AbouttAttendeeScore
                type="Wrong"
                metric={quiz?.questions?.length - correctAnswers || 0}
                Icon={
                  <InlineIcon
                    icon="line-md:close-circle-twotone"
                    fontSize={18}
                    color="#ef4444"
                  />
                }
              />
            </div>
          </div>
          <Button
            className="rounded-lg border mt-6 self-center border-basePrimary gap-x-2 bg-basePrimary-200"
            onClick={() => {
              // close();
              setIsQuizResult?.(false);
            }}
          >
            <InlineIcon
              fontSize={22}
              icon="iconoir:leaderboard-star"
              color="#9D00FF"
            />
            <p className="gradient-text bg-basePrimary">LeaderBoard</p>
          </Button>
        </div>
      )}

      {!isAnswers && (
        <Button
          onClick={showAnswers}
          className="absolute bottom-2  right-2 bg-basePrimary h-11 rounded-md text-mobile"
        >
          <p className="text-white">View Quiz Result</p>
        </Button>
      )}
    </div>
  );
}
function AbouttAttendeeScore({
  Icon,
  metric,
  type,
  className,
}: {
  metric: number;
  Icon: React.ReactNode;
  type: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-2 items-center justify-center",
        className
      )}
    >
      <p className="font-semibold text-lg sm:text-2xl">{metric}</p>
      <div className="flex items-center text-sm gap-x-2">
        {Icon}
        <p className="capitalize">{type}</p>
      </div>
    </div>
  );
}
function AnswerSheet({
  quiz,
  close,
  answer,
  userAvatar,
  className,
}: {
  quiz: TQuiz<TRefinedQuestion[]>;
  answer: TAnswer[];
  close?: () => void;
  userAvatar: Required<AvatarFullConfig> | undefined;
  className?: string;
}) {
  // const [showExplanation, setShowExplanation] = useState(false);

  // function toggleExplanationVisibility() {
  //   setShowExplanation((prev) => !prev);
  // }
  const optionLetter = ["A", "B", "C", "D"];

  return (
    <div
      className={cn(
        "w-full max-w-4xl absolute top-0 mx-auto inset-x-0 bg-white p-4",
        className
      )}
    >
      {close && (
        <div className="w-full flex items-center justify-between pb-3 border-b">
          <p>Quiz Result</p>
          <Button
            onClick={close}
            className="h-8 w-8 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
          >
            <InlineIcon
              icon={"mingcute:close-line"}
              fontSize={20}
              color="#ffffff"
            />
          </Button>
        </div>
      )}

      <div className="W-full max-w-2xl mx-auto mt-8 flex gap-y-3 flex-col items-start justify-start">
        {Array.isArray(quiz?.questions) &&
          quiz?.questions?.map((question, index) => {
            // // correct answer index
            // const correctAnswerIndex = question?.options?.findIndex(
            //   ({ isAnswer }) => isAnswer !== ""
            // );
            // // chosen answer index
            // const chosenAsnwerIndex = question?.options?.findIndex(
            //   ({ isCorrect }) => typeof isCorrect === "boolean"
            // );
            // // chosen answer
            // const chosenAnswer = question?.options?.find(
            //   ({ isCorrect }) => typeof isCorrect === "boolean"
            // );

            // // correct answer
            // const correctAnswer = question?.options?.find(
            //   ({ isAnswer }) => isAnswer !== ""
            // );

            // const isImageOption = question?.options?.some((opt) =>
            //   (opt?.option as string)?.startsWith("https://")
            // );

            // const correctOption = () => {
            //   const i = answer?.filter((ans) => {
            //     return (
            //       question?.options[correctAnswerIndex].optionId ===
            //       ans?.selectedOptionId?.optionId
            //     );
            //   });

            //   return i?.length || 0;
            // };

            return (
              <div className="w-full space-y-4 bg-basePrimary-200 rounded-lg p-4  ">
                <h2>{`Question ${index + 1}`}</h2>

                <div
                  className="innerhtml text-center w-full"
                  dangerouslySetInnerHTML={{
                    __html: question?.question ?? "",
                  }}
                />
                {question?.questionImage && (
                  <Image
                    className="w-full max-w-[10rem] mx-auto rounded-md h-40 object-cover"
                    src={question?.questionImage}
                    width={700}
                    height={300}
                    alt=""
                  />
                )}

                {question?.options?.map((option, index) => {
                  const isImageOption = (option?.option as string)?.startsWith(
                    "https://"
                  );

                  const chosedOption = () => {
                    const i = answer?.filter((ans) => {
                      return (
                        option.optionId === ans?.selectedOptionId?.optionId
                      );
                    });

                    return i?.length || 0;
                  };

                  return (
                    <>
                      {isImageOption ? (
                        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                          <div
                            className={cn(
                              "w-fit   gap-3 bg-basePrimary-100 flex flex-col  items-center p-2 h-fit rounded-lg ",
                              typeof option.isCorrect === "boolean" &&
                                option?.isCorrect &&
                                "bg-green-500 text-white",
                              typeof option?.isCorrect === "boolean" &&
                                !option?.isCorrect &&
                                "bg-red-500 text-white"
                            )}
                          >
                            <div className={cn("w-full flex justify-center items-center", typeof option?.isCorrect === "boolean" && "items-end justify-between" )}>
                              <p className="w-1 h-1"></p>
                              <span
                                className={cn(
                                  "rounded-lg h-9 flex items-center  justify-center font-medium w-9 bg-white border border-gray-700",
                                  typeof option?.isCorrect === "boolean" &&
                                    option?.isCorrect &&
                                    "text-green-500",
                                  typeof option?.isCorrect === "boolean" &&
                                    !option?.isCorrect &&
                                    "text-red-500"
                                )}
                              >
                                {optionLetter[index]}
                              </span>
                              {typeof option?.isCorrect === "boolean" && (
                                <Avatar
                                  {...userAvatar}
                                  shape="circle"
                                  className="w-7 h-7 rounded-full"
                                />
                              )}
                            </div>
                            <div className="w-full flex items-center justify-between">
                              <div className="w-11/12 relative h-2  ring-1 ring-white rounded-3xl bg-gray-200">
                                <span
                                  style={{
                                    width: chosedOption()
                                      ? `${(
                                          (chosedOption() / answer?.length) *
                                          100
                                        ).toFixed(0)}%`
                                      : "0%",
                                  }}
                                  className={cn(
                                    "absolute rounded-3xl bg-[#001fcc]  inset-0  h-full",
                                    typeof option?.isCorrect === "boolean" &&
                                      option?.isCorrect &&
                                      "bg-green-500",
                                    typeof option?.isCorrect === "boolean" &&
                                      !option?.isCorrect &&
                                      "bg-red-500"
                                  )}
                                ></span>
                              </div>

                              <div className="text-mobile">
                                <span>
                                  {chosedOption
                                    ? `${(
                                        (chosedOption() / answer?.length) *
                                        100
                                      ).toFixed(0)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                            <Image
                              src={option?.option}
                              alt=""
                              width={400}
                              height={400}
                              className="w-28 rounded-lg object-cover h-32"
                            />
                          </div>
                          {/* 
                    <div
                      className={cn(
                        "w-fit  text-white gap-3 flex flex-col bg-green-500 items-center p-2 h-fit rounded-lg "
                      )}
                    >
                      <span
                        className={cn(
                          "rounded-lg h-9 flex items-center text-green-500 justify-center font-medium w-9 bg-white border border-gray-700"
                        )}
                      >
                        {optionLetter[correctAnswerIndex]}
                      </span>
                      <div className="w-full flex items-center justify-between">
                        <div className="w-11/12 relative h-2 ring-1 ring-white rounded-3xl bg-gray-200">
                          <span
                            style={{
                              width: correctOption()
                                ? `${(
                                    (correctOption() / answer?.length) *
                                    100
                                  ).toFixed(0)}%`
                                : "0%",
                            }}
                            className={cn(
                              "absolute rounded-3xl bg-green-500 inset-0  h-full"
                            )}
                          ></span>
                        </div>

                        <div className="text-mobile">
                          <span>
                            {correctOption
                              ? `${(
                                  (correctOption() / answer?.length) *
                                  100
                                ).toFixed(0)}%`
                              : "0%"}
                          </span>
                        </div>
                      </div>
                      <Image
                        src={correctAnswer?.option}
                        alt=""
                        width={400}
                        height={400}
                        className="w-28 rounded-lg object-cover h-32"
                      />
                    </div> */}
                        </div>
                      ) : (
                        <div className="w-full ">
                          <div className="w-[95%] flex flex-col gap-y-2 items-start justify-start">
                            <div
                              className={cn(
                                " rounded-lg font-medium relative bg-basePrimary-100 w-full px-2 py-3 flex flex-col items-start justify-start",
                                typeof option?.isCorrect === "boolean" &&
                                  option?.isCorrect &&
                                  "bg-green-500 text-white",
                                typeof option?.isCorrect === "boolean" &&
                                  !option?.isCorrect &&
                                  "bg-red-500 text-white"
                              )}
                            >
                              <div className="w-full flex items-center gap-x-2">
                                <span
                                  className={cn(
                                    "rounded-lg h-10 flex items-center justify-center  font-medium w-10 bg-white border border-gray-700",
                                    typeof option?.isCorrect === "boolean" &&
                                      option?.isCorrect &&
                                      "text-green-500",
                                    typeof option?.isCorrect === "boolean" &&
                                      !option?.isCorrect &&
                                      "text-red-500"
                                  )}
                                >
                                  {optionLetter[index]}
                                </span>
                                <p
                                  className="innerhtml "
                                  dangerouslySetInnerHTML={{
                                    __html: option?.option ?? "",
                                  }}
                                />
                              </div>
                              <div className="w-full flex mt-2 items-center justify-between">
                                <div className="w-11/12 relative h-2 ring-1 ring-white rounded-3xl bg-gray-200">
                                  <span
                                    style={{
                                      width: chosedOption()
                                        ? `${(
                                            (chosedOption() / answer?.length) *
                                            100
                                          ).toFixed(0)}%`
                                        : "0%",
                                    }}
                                    className={cn(
                                      "absolute rounded-3xl bg-[#001fcc] inset-0  h-full",
                                      typeof option?.isCorrect === "boolean" &&
                                        option?.isCorrect &&
                                        "bg-green-500",
                                      typeof option?.isCorrect === "boolean" &&
                                        !option?.isCorrect &&
                                        "bg-red-500"
                                    )}
                                  ></span>
                                </div>

                                <div className="text-mobile">
                                  <span>
                                    {chosedOption()
                                      ? `${(
                                          (chosedOption() / answer?.length) *
                                          100
                                        ).toFixed(0)}%`
                                      : "0%"}
                                  </span>
                                </div>
                              </div>

                              {typeof option?.isCorrect === "boolean" && (
                                <Avatar
                                  {...userAvatar}
                                  shape="circle"
                                  className="w-8 h-8 absolute top-[35%] right-[-40px] rounded-full"
                                />
                              )}
                            </div>
                            {/* <div className="text-white rounded-lg font-medium bg-green-500 w-full px-2 py-3 flex flex-col items-start justify-start">
                        <div className="w-full flex items-center gap-x-2">
                          <span
                            className={cn(
                              "rounded-lg h-10 flex items-center justify-center text-green-500 font-medium w-10 bg-white border border-gray-700"
                            )}
                          >
                            {optionLetter[correctAnswerIndex]}
                          </span>

                          <p
                            className="innerhtml text-white"
                            dangerouslySetInnerHTML={{
                              __html: correctAnswer?.option ?? "",
                            }}
                          />
                        </div>

                        <div className="w-full flex items-center justify-between">
                          <div className="w-11/12 relative h-2 ring-1 ring-white rounded-3xl bg-gray-200">
                            <span
                              style={{
                                width: correctOption()
                                  ? `${(
                                      (correctOption() / answer?.length) *
                                      100
                                    ).toFixed(0)}%`
                                  : "0%",
                              }}
                              className={cn(
                                "absolute rounded-3xl bg-green-500 inset-0  h-full"
                              )}
                            ></span>
                          </div>

                          <div className="text-mobile">
                            <span>
                              {correctOption()
                                ? `${(
                                    (correctOption() / answer?.length) *
                                    100
                                  ).toFixed(0)}%`
                                : "0%"}
                            </span>
                          </div>
                        </div>
                      </div> */}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })}

                {/* {showExplanation && (
                  <p className="mb-3 text-xs sm:text-sm text-gray-500">
                    {question?.feedBack ?? "No Explanation"}
                  </p>
                )}

                <button
                  onClick={toggleExplanationVisibility}
                  className="text-xs sm:text-sm text-basePrimary underline"
                >
                  {showExplanation ? "Hide Explanation" : "Show Explanation"}
                </button> */}
              </div>
            );
          })}
      </div>
    </div>
  );
}

interface TselectedPlayer {
  playerIndex: number;
  player: TLeaderBoard;
}

function OrganizerSheet({
  close,
  players,
  quiz,
  answers,
}: {
  players: TLeaderBoard[];
  close: () => void;
  quiz: TQuiz<TQuestion[]> | null;
  answers: TAnswer[];
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<TselectedPlayer | null>(
    null
  );
  const [refinedQuiz, setQuiz] = useState<TQuiz<TRefinedQuestion[]> | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  console.log(refinedQuiz);
  const userAvatar = useMemo(() => {
    if (selectedPlayer) {
      const playerId = selectedPlayer?.player.quizParticipantId;
      return players?.find(
        ({ quizParticipantId, image }) => quizParticipantId === playerId
      )?.image;
    }
  }, [selectedPlayer]);

  return (
    <div className="w-full max-w-7xl absolute h-[90vh] overflow-y-auto vert-scroll rounded-lg top-0 m-auto inset-0 bg-white p-6">
      <div className="w-full flex items-center justify-between mb-6">
        <button onClick={close}>
          <InlineIcon
            icon="material-symbols:arrow-back-rounded"
            fontSize={20}
          />
        </button>

        <p className="font-semibold text-base sm:text-lg">Player Result</p>
        <Button className="flex items-center bg-basePrimary h-10 text-white rounded-lg gap-x-2">
          <InlineIcon icon="carbon:export" fontSize={18} color="#ffffff" />
          <p>Export as CSV</p>
        </Button>
      </div>

      <div className="w-full max-w-sm mx-auto mb-6">
        <p className="font-medium text-sm sm:text-base mb-2">
          Select Recipient:
        </p>
        <button onClick={() => setIsOpen(true)} className="w-full relative">
          {selectedPlayer ? (
            <PlayerRankWidget
              player={selectedPlayer.player}
              position={formatPosition(selectedPlayer.playerIndex + 1)}
              isSelected
              className="border-b px-4"
            />
          ) : (
            <div className="w-full border-b p-3 flex items-center justify-between">
              <p className="text-gray-300">Select Player</p>
              <InlineIcon
                icon="iconoir:nav-arrow-up"
                fontSize={18}
                color="#d1d5db"
              />
            </div>
          )}
          {isOpen && quiz && (
            <OrganizerPlayerDropDown
              close={() => setIsOpen(false)}
              players={players}
              setQuiz={setQuiz}
              quiz={quiz}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={setSelectedPlayer}
            />
          )}
        </button>
      </div>
      {selectedPlayer && refinedQuiz && (
        <AnswerSheet
          className="relative bg-transparent max-w-full"
          answer={answers}
          quiz={refinedQuiz}
          userAvatar={userAvatar}
          key={selectedPlayer.playerIndex}
        />
      )}
    </div>
  );
}

function OrganizerPlayerDropDown({
  players,
  setSelectedPlayer,
  selectedPlayer,
  close,
  setQuiz,
  quiz,
}: {
  players: TLeaderBoard[];
  setSelectedPlayer: React.Dispatch<
    React.SetStateAction<TselectedPlayer | null>
  >;
  selectedPlayer: TselectedPlayer | null;
  close: () => void;
  setQuiz: React.Dispatch<
    React.SetStateAction<TQuiz<TRefinedQuestion[]> | null>
  >;
  quiz: TQuiz<TQuestion[]>;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full absolute top-14"
    >
      <div
        onClick={close}
        className="w-full h-full inset-0 fixed z-[999]"
      ></div>
      <div className="w-full relative bg-white z-[9999] py-4">
        <div className="w-full flex flex-col items-start justify-start">
          {players.map((player, index) => (
            <button
              onClick={() => {
                setSelectedPlayer({ player, playerIndex: index });
                const data: TQuiz<TRefinedQuestion[]> = {
                  ...quiz,
                  questions: player?.answeredQuestion,
                };
                setQuiz(data);
                close();
              }}
              className={cn(
                "w-full border-b",
                selectedPlayer?.playerIndex === index && "bg-basePrimary-100"
              )}
              key={index}
            >
              <PlayerRankWidget
                player={player}
                position={formatPosition(index + 1)}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
