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
import Avatar, { AvatarFullConfig } from "react-nice-avatar";
import { ArrowUpwardOutline } from "styled-icons/evaicons-outline";
import { useDeleteRequest, usePostRequest } from "@/hooks/services/requests";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { formatPosition } from "@/utils";
import { ActionModal } from "@/components/custom/ActionModal";

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
  const { deleteData } = useDeleteRequest(
    `engagements/quiz/answer/${actualQuiz?.quizAlias}`
  );
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
    //setQuizResult((prev) => !prev);
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

  const userAvatar = useMemo(() => {
    if (isAttendee) {
      const playerId = id;
      return board?.find(
        ({ quizParticipantId, image }) => quizParticipantId === playerId
      )?.image;
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
    window.open(
      `/e/${actualQuiz?.workspaceAlias}/quiz/${isAttendee ? "a" : "o"}/${
        actualQuiz?.quizAlias
      }/presentation`
    );
    // window.location.reload();
  }

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
          setIsQuizResult={setIsQuizResult}
          noOfParticipants={board.length}
          userAvatar={userAvatar}
          answers={answers}
        />
      ) : (
        <div className="w-full inset-0 fixed overflow-x-auto h-full ">
          {!isAttendee ? (
            <div className="w-full flex items-center justify-between">
              <Button className="rounded-lg border border-basePrimary gap-x-2 bg-basePrimary-200">
                <InlineIcon
                  fontSize={22}
                  icon="iconoir:leaderboard-star"
                  color="#9D00FF"
                />
                <p className="gradient-text bg-basePrimary">LeaderBoard</p>
              </Button>

              <div className="flex items-center gap-x-[1px]">
                <Button className="flex items-center text-white bg-basePrimary h-10 rounded-none rounded-l-lg gap-x-2">
                  <InlineIcon
                    icon="mdi:eye-outline"
                    fontSize={18}
                    color="#ffffff"
                  />
                  <p>View Individual Quiz Result</p>
                </Button>
                <Button className="flex items-center rounded-none bg-basePrimary h-10 text-white rounded-r-lg gap-x-2">
                  <InlineIcon
                    icon="carbon:export"
                    fontSize={18}
                    color="#ffffff"
                  />
                  <p>Export as CSV</p>
                </Button>
                <Button
                  onClick={onToggleClear}
                  className="flex items-center rounded-none h-10  bg-red-500 text-white rounded-r-lg gap-x-2"
                >
                  <InlineIcon
                    icon="mingcute:delete-line"
                    fontSize={18}
                    color="#ffffff"
                  />
                  <p>Delete Record</p>
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
                      board[1]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col mr-11 items-center justify-center gap-y-2">
                      <Avatar
                        shape="square"
                        style={{ borderRadius: "12px" }}
                        className="w-[5rem]  h-[5rem]"
                        {...board[1]?.image}
                      />
                      <p className="text-zinc-700 text-sm font-medium">
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
                      board[0]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-y-2">
                      <Avatar
                        shape="square"
                        style={{ borderRadius: "12px" }}
                        className="w-[5rem] h-[5rem]"
                        {...board[0]?.image}
                      />
                      <p className="text-zinc-700 font-medium text-sm">
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
                      board[2]?.attendeeName && "visible"
                    )}
                  >
                    <div className="flex flex-col ml-11 items-center justify-center gap-y-2">
                      <Avatar
                        shape="square"
                        style={{ borderRadius: "12px" }}
                        className="w-[5rem] h-[5rem]"
                        {...board[2]?.image}
                      />
                      <p className="text-zinc-700 text-sm font-medium">
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
                    <p>Participants ({board.slice(3, board?.length).length})</p>
                    <p className="text-end">Points</p>
                  </div>
                )}
                <div className="w-full flex flex-col items-start justify-start">
                  {Array.isArray(board) &&
                    board.slice(3, board?.length).map((player, index) => (
                      <div
                        key={index}
                        className={cn(
                          "grid grid-cols-3 px-8 items-center w-full py-3 border-b ",
                          player.quizParticipantId === id &&
                            "bg-basePrimary-200"
                        )}
                      >
                        <div className="flex items-center col-span-2 gap-x-3">
                          <p>{`${index + 4}th`}</p>
                          {/* <Image
                              src="/quizattendee.png"
                              className="w-[4rem] h-[4rem]"
                              alt=""
                              width={150}
                              height={150}
                            />*/}
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
                        <div className="flex items-center justify-end gap-x-1">
                          <p className="flex items-center">
                            <span>
                              {Number(player?.totalScore ?? 0).toFixed(0)} pt
                            </span>
                          </p>
                          {/* {player?.recentScore > 0 && (
                            <div className="flex text-white bg-basePrimary rounded-3xl px-2 py-1 items-center gap-x-1 text-xs">
                              <ArrowUpwardOutline size={15} />
                              <p>{Number(player?.recentScore)?.toFixed(0)}</p>
                            </div>
                          )} */}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
                metric={quiz?.questions?.length - correctAnswers ?? 0}
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
}: {
  quiz: TQuiz<TRefinedQuestion[]>;
  answer: TAnswer[];
  close: () => void;
  userAvatar: Required<AvatarFullConfig> | undefined;
}) {
  // const [showExplanation, setShowExplanation] = useState(false);

  // function toggleExplanationVisibility() {
  //   setShowExplanation((prev) => !prev);
  // }
  const optionLetter = ["1", "2", "3", "4"];

  return (
    <div className="w-full max-w-4xl absolute top-0 mx-auto inset-x-0 bg-white p-4">
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

            // correct answer
            const correctAnswer = question?.options?.find(
              ({ isAnswer }) => isAnswer !== ""
            );

            const isImageOption = question?.options?.some((opt) =>
              (opt?.option as string)?.startsWith("https://")
            );
            const chosedOption = () => {
              const i = answer?.filter((ans) => {
                return (
                  question?.options[chosenAsnwerIndex].optionId ===
                  ans?.selectedOptionId?.optionId
                );
              });

              return i?.length || 0;
            };

            const correctOption = () => {
              const i = answer?.filter((ans) => {
                return (
                  question?.options[correctAnswerIndex].optionId ===
                  ans?.selectedOptionId?.optionId
                );
              });

              return i?.length || 0;
            };

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

                {isImageOption ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <div
                      className={cn(
                        "w-fit  text-white gap-3 flex flex-col bg-red-500 items-center p-2 h-fit rounded-lg ",
                        typeof chosenAnswer?.isCorrect === "boolean" &&
                          chosenAnswer?.isCorrect &&
                          "bg-green-500"
                      )}
                    >
                      <div className="w-full flex items-end justify-between">
                        <p className="w-1 h-1"></p>
                        <span
                          className={cn(
                            "rounded-lg h-9 flex items-center text-red-500 justify-center font-medium w-9 bg-white border border-gray-700",
                            typeof chosenAnswer?.isCorrect === "boolean" &&
                              chosenAnswer?.isCorrect &&
                              "text-green-500"
                          )}
                        >
                          {optionLetter[chosenAsnwerIndex]}
                        </span>
                        <Avatar
                          {...userAvatar}
                          shape="circle"
                          className="w-7 h-7 rounded-full"
                        />
                      </div>
                      <div className="w-full flex items-center justify-between">
                        <div className="w-11/12 relative h-2 ring-1 rounded-3xl bg-gray-200">
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
                              "absolute rounded-3xl bg-red-500 inset-0  h-full",
                              typeof chosenAnswer?.isCorrect === "boolean" &&
                                chosenAnswer?.isCorrect &&
                                "bg-green-500"
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
                        src={chosenAnswer?.option}
                        alt=""
                        width={400}
                        height={400}
                        className="w-28 rounded-lg object-cover h-32"
                      />
                    </div>

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
                        <div className="w-11/12 relative h-2 ring-1 rounded-3xl bg-gray-200">
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
                    </div>
                  </div>
                ) : (
                  <div className="w-full ">
                    <div className="w-[95%] flex flex-col gap-y-2 items-start justify-start">
                      <div
                        className={cn(
                          "text-white rounded-lg font-medium relative bg-red-500 w-full px-2 py-3 flex flex-col items-start justify-start",
                          typeof chosenAnswer?.isCorrect === "boolean" &&
                            chosenAnswer?.isCorrect &&
                            "bg-green-500"
                        )}
                      >
                        <div className="w-full flex items-center gap-x-2">
                          <span
                            className={cn(
                              "rounded-lg h-10 flex items-center justify-center text-red-500 font-medium w-10 bg-white border border-gray-700",
                              typeof chosenAnswer?.isCorrect === "boolean" &&
                                chosenAnswer?.isCorrect &&
                                "text-green-500"
                            )}
                          >
                            {optionLetter[chosenAsnwerIndex]}
                          </span>
                          <p
                            className="innerhtml text-white"
                            dangerouslySetInnerHTML={{
                              __html: chosenAnswer?.option ?? "",
                            }}
                          />
                        </div>
                        <div className="w-full flex mt-2 items-center justify-between">
                          <div className="w-11/12 relative h-2 ring-1 rounded-3xl bg-gray-200">
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
                                "absolute rounded-3xl bg-red-500 inset-0  h-full",
                                typeof chosenAnswer?.isCorrect === "boolean" &&
                                chosenAnswer?.isCorrect &&
                                "bg-green-500"
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

                        <Avatar
                          {...userAvatar}
                          shape="circle"
                          className="w-8 h-8 absolute top-[35%] right-[-40px] rounded-full"
                        />
                      </div>
                      <div className="text-white rounded-lg font-medium bg-green-500 w-full px-2 py-3 flex flex-col items-start justify-start">
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
                          <div className="w-11/12 relative h-2 ring-1 rounded-3xl bg-gray-200">
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
                      </div>
                    </div>
                  </div>
                )}

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

function OrganizerSheet() {
  return (
    <div className="w-full max-w-4xl absolute top-0 mx-auto inset-x-0 bg-white p-4"></div>
  );
}
