"use client";

import Image from "next/image";
import { Option } from "../../common";
import { Button } from "@/components/custom";
import { Maximize2 } from "styled-icons/feather";
import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import {
  TQuiz,
  TRefinedQuestion,
  TAnswer,
  TQuestion,
  TConnectedUser,
  TLiveQuizParticipant,
} from "@/types/quiz";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { AvatarFullConfig } from "react-nice-avatar";
import { JoiningAttemptTab } from "./JoinAttemptTab";
import { isAfter } from "date-fns";
import { usePostRequest } from "@/hooks/services/requests";
import { TopSection } from "../../_components";
import Link from "next/link";

export type QuestionViewRef = {
  onNextBtnClick: () => void;
  loading: boolean;
    isUpdating: boolean;
};

type ChosenAnswerStatus = {
  isCorrect: boolean;
  correctOption: number;
};

type TQuestionProps = {
  isRightBox: boolean;
  isLeftBox: boolean;
  quizParticipantId: string;
  toggleLeftBox: () => void;
  toggleRightBox: () => void;
  quiz: TQuiz<TRefinedQuestion[]>;
  updateQuiz: (q: TQuiz<TRefinedQuestion[]>) => void;
  attendeeDetail: {
    attendeeId: string | null;
    attendeeName: string;
    avatar: Required<AvatarFullConfig>;
    email: string;
    phone: string;
  };
  isAttendee?:boolean;
  className?:string;
  answer: TAnswer[];
  quizAnswer: TAnswer[];
  refetchQuiz: () => Promise<any>;
  getAnswer: (questionId: string) => Promise<any>;
  refetchQuizAnswers: (id: number) => Promise<any>;
  onOpenScoreSheet: () => void;
  updateQuizResult: (q: TQuiz<TRefinedQuestion[]>) => void;
  // goBack: () => void;
  liveQuizPlayers: TLiveQuizParticipant[];
  getLiveParticipant: () => Promise<any>;
  actualQuiz: TQuiz<TQuestion[]>;
};

export const QuestionView = forwardRef<QuestionViewRef, TQuestionProps>(({
  isRightBox,
  isLeftBox,
  toggleRightBox,
  toggleLeftBox,
  quiz,
  updateQuiz,
  attendeeDetail,
  isAttendee,
  quizParticipantId,
  answer,
  getAnswer,
  refetchQuizAnswers,
  quizAnswer,
  refetchQuiz,
  onOpenScoreSheet,
  updateQuizResult,
  // goBack,
  liveQuizPlayers,
  getLiveParticipant,
  actualQuiz,
  className
}: TQuestionProps, ref) => {
  const [currentQuestion, setCurrentQuestion] =
    useState<TRefinedQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [millisecondsLeft, setMillisecondsLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswerMetric, setShowAnswerMetric] = useState(false);
  const [transiting, setShowTransiting] = useState(false);
  const { postData: updatingQuiz, isLoading: isUpdating } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [isJoiningAttempt, setIsJoiningAttempt] = useState(false);
  const [chosenAnswerStatus, setChosenAnswerStatus] =
    useState<ChosenAnswerStatus | null>(null);
  const { postData: createAnswer } = usePostRequest<Partial<TAnswer>>(
    "engagements/quiz/answer"
  );

  useImperativeHandle(ref, () => ({
    onNextBtnClick,
    loading,
    isUpdating
  }));

  useEffect(() => {
    (async () => {
      if (quiz && quiz?.accessibility?.live && quiz?.liveMode?.isStarting && !isAttendee) {
        const { liveMode, ...restData } = quiz;
        const { startingAt } = liveMode;

        const payload: Partial<TQuiz<TQuestion[]>> = {
          ...restData,
          liveMode: {
            startingAt,
            questionIndex: currentQuestionIndex,
            questions: quiz?.questions?.map((item) => {
              return {
                ...item,
                options: item?.options?.map(({ isCorrect, ...rest }) => rest),
              };
            }),
            current: quiz?.questions[currentQuestionIndex],
            isTransitioning: quiz?.accessibility?.countdown,
          },
        };

        await updatingQuiz({ payload });
        await refetchQuiz();
        setCurrentQuestion(quiz.questions[currentQuestionIndex]);

        // console.log("admin 1");
      }
      // console.log("not suppose to be here")
    })();
  }, []);

  useEffect(() => {
    if (quiz && !quiz?.accessibility?.live) {
      setCurrentQuestion(quiz.questions[currentQuestionIndex]);
    }
  }, [quiz, currentQuestionIndex]);

  //attendee
  useEffect(() => {
    if (quiz && quiz?.accessibility?.live && isAttendee) {
      if (quiz?.liveMode?.current) {
        setCurrentQuestion(quiz?.liveMode?.current);
        setShowAnswerMetric(false);
      }
      if (typeof quiz?.liveMode?.questionIndex === "number") {
        setCurrentQuestionIndex(quiz?.liveMode?.questionIndex);
      }
      if (quiz?.liveMode?.isTransitioning) {
        setShowTransiting(quiz?.liveMode?.isTransitioning);
      }

      if (typeof quiz?.liveMode?.isShowAnswerMetric === "boolean") {
        setShowAnswerMetric(quiz?.liveMode?.isShowAnswerMetric);
      }
      if (quiz?.liveMode?.answerStatus === null) {
        setChosenAnswerStatus(quiz?.liveMode?.answerStatus);
      }
      if (typeof quiz?.liveMode?.explanation === "boolean") {
        setShowExplanation(quiz?.liveMode?.explanation);
      }
      if (typeof quiz?.liveMode?.isOptionSelected === "boolean") {
        setIsOptionSelected(quiz?.liveMode?.isOptionSelected);
      }
    }
  }, [quiz]);

  // isOptionSelected quiz?.liveMode?.isOptionSelected &&
  useEffect(() => {
    (async () => {
      if (quiz && quiz?.accessibility?.live && !isAttendee) {
        if (currentQuestion) {
          await getAnswer(currentQuestion?.id);
        }
      }
    })();
  }, [quiz]);
  // console.log("yu", quiz?.liveMode);

  const timing = useMemo(() => {
   
    const seconds = Math.floor(
      (millisecondsLeft % (Number(currentQuestion?.duration) * 1000)) / 1000
    );
     console.log( seconds, millisecondsLeft)

    return seconds;
  }, [millisecondsLeft, currentQuestion]);

  useEffect(() => {
    if (currentQuestion?.duration) {
      setMillisecondsLeft(Number(currentQuestion?.duration) * 1000);
    }
  }, [currentQuestion?.id]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setMillisecondsLeft((prevMilliseconds) => {
        if (prevMilliseconds <= 1000) {
          //  setShowAnswerMetric(true);
          clearInterval(countdownInterval);
          return 0;
        }

        return prevMilliseconds - 1000;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [millisecondsLeft]);

  useEffect(() => {
    if (currentQuestion?.id) {
      getAnswer(currentQuestion?.id);
    }
  }, [currentQuestion?.id]);

  async function nextQuestion() {
    if (quiz?.accessibility?.live) {
      const { questions, liveMode, ...restData } = quiz;

      const payload: Partial<TQuiz<TQuestion[]>> = {
        ...restData,
        questions: quiz?.questions?.map((item) => {
          return {
            ...item,
            options: item?.options?.map(({ isCorrect, ...rest }) => rest),
          };
        }),
        liveMode: {
          startingAt: liveMode?.startingAt,
          questionIndex: currentQuestionIndex + 1,
          current: quiz?.questions[currentQuestionIndex + 1],
          isTransitioning: quiz?.accessibility?.countdown,
          answerStatus: null,
          explanation: false,
          isOptionSelected: false,
        },
      };
      if (!isAttendee) {
        setCurrentQuestion(quiz?.questions[currentQuestionIndex + 1]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowTransiting(quiz?.accessibility?.countdown);
      }

      await updatingQuiz({ payload });
      refetchQuiz();
    } else {
      setShowAnswerMetric(false);
      setShowExplanation(false);
      setChosenAnswerStatus(null);
      //if (currentQuestionIndex < quiz.questions.length) {
      // }
      if (quiz?.accessibility?.countdown) {
        setShowTransiting(quiz?.accessibility?.countdown);
        setTimeout(() => {
          setShowTransiting(false);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 6000);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  }

  // admin
  useEffect(() => {
    if (quiz && quiz?.accessibility?.live && isAttendee) {
      setShowTransiting(quiz?.accessibility?.countdown);
      // console.log("admin");
    }
  }, []);

  async function showMetric() {
    if (!quiz?.accessibility?.live) {
      setShowAnswerMetric(true);
    } else {
      if (timing > 0) return;
      const { questions, liveMode, ...restData } = quiz;
      const { startingAt } = liveMode;
      const payload: Partial<TQuiz<TQuestion[]>> = {
        ...restData,
        questions: quiz?.questions?.map((item) => {
          return {
            ...item,
            options: item?.options?.map(({ isCorrect, ...rest }) => rest),
          };
        }),
        liveMode: {
          startingAt,
          isShowAnswerMetric: true,
          isOptionSelected: false,
          correctOptionId: currentQuestion?.options?.find(
            (i) => i?.isAnswer === i?.optionId
          )?.optionId,
        },
      };

      await updatingQuiz({ payload });
      setShowAnswerMetric(true);
      refetchQuiz();
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  const optionLetter = ["A", "B", "C", "D"];

  // console.log("answer", answer)
  async function selectOption(id: string) {
    setLoading(true);
    if (currentQuestion) {
      const updatedOptions = currentQuestion?.options?.map((item) => {
        if (item?.optionId === id) {
          return {
            ...item,
            isCorrect: item?.isAnswer === id,
          };
        }
        return item;
      });
      setCurrentQuestion({ ...currentQuestion, options: updatedOptions });

      // user score: (correct 1, wrong 0), dependent on time

      // checking if the correct answer is chosen
      const isCorrectAnswer = currentQuestion?.options?.some(
        (item) => item?.isAnswer === id
      );

      // index of current Question
      const index = quiz?.questions?.findIndex(
        (item) => item?.id === currentQuestion?.id
      );

      // find the index of the correct option
      const correctAnswerIndex = currentQuestion?.options?.findIndex(
        (opt) => opt.isAnswer !== ""
      );
      setChosenAnswerStatus({
        isCorrect: isCorrectAnswer,
        correctOption: correctAnswerIndex,
      });
      //
      const score = isCorrectAnswer ? 1 : 0;
      // calculate the user point
      const attendeePoints =
        ((score * millisecondsLeft) / (Number(currentQuestion?.duration) * 1000)) *
        Number(currentQuestion?.points);

      // update quiz state
      const updatedQuiz: TQuiz<TRefinedQuestion[]> = {
        ...quiz,
        questions: quiz?.questions?.map((item) => {
          if (item?.id === currentQuestion?.id) {
            return {
              ...item,
              options: updatedOptions,
            };
          }
          return item;
        }),
      };

      // udpate chosen option state, if quiz is not live
      if (!quiz?.accessibility?.live) {
        updateQuiz(updatedQuiz);
      }
      updateQuizResult(updatedQuiz);

      const payload: Partial<TAnswer> = {
        ...attendeeDetail,
        quizId: quiz?.id,
        eventAlias: quiz?.eventAlias,
        questionId: currentQuestion?.id,
        quizParticipantId: quizParticipantId,

        attendeePoints,
        answerDuration: millisecondsLeft,
        quizAlias: quiz?.quizAlias,
        maxPoints: Number(currentQuestion?.points),
        maxDuration: Number(currentQuestion?.duration),
        selectedOptionId: { optionId: id },
        correctOptionId: {
          optionId:
            currentQuestion?.options?.find(({ isAnswer }) => isAnswer === id)
              ?.optionId || "",
        },
      };

      await createAnswer({ payload });

      if (quiz?.accessibility?.live) {
        const { questions, liveMode, ...restData } = quiz;
        const payload: Partial<TQuiz<TQuestion[]>> = {
          ...restData,
          questions: quiz?.questions?.map((item) => {
            return {
              ...item,
              options: item?.options?.map(({ isCorrect, ...rest }) => rest),
            };
          }),
          liveMode: {
            startingAt: liveMode?.startingAt,
            isOptionSelected: false,
          },
        };

        await updatingQuiz({ payload });
        refetchQuiz();
      }

      await getAnswer(currentQuestion?.id);
      refetchQuizAnswers(quiz?.id);
      setLoading(false);
    }
  }

  function toggleExplanationVisibility() {
    setShowExplanation((prev) => !prev);
  }

  // quiz result
  async function openQuizResult() {
    onOpenScoreSheet();
    if (quiz?.accessibility?.live) {
      const { questions, liveMode, ...restData } = quiz;
      const payload: Partial<TQuiz<TQuestion[]>> = {
        ...restData,
        questions: quiz?.questions?.map((item) => {
          return {
            ...item,
            options: item?.options?.map(({ isCorrect, ...rest }) => rest),
          };
        }),
        liveMode: {
          isEnded: true,
          startingAt: liveMode?.startingAt,
        },
      };

      await updatingQuiz({ payload });
      refetchQuiz();
      onOpenScoreSheet();
    }
  }

  async function onNextBtnClick() {
    if (loading || isUpdating) return;
    setIsOptionSelected(false);
    if (
      showAnswerMetric &&
      currentQuestionIndex >= quiz?.questions?.length - 1
    ) {
      await openQuizResult();
    } else if (
      showAnswerMetric &&
      currentQuestionIndex < quiz?.questions?.length - 1
    ) {
      nextQuestion();
      setShowAnswerMetric(false);
    } else if (
      !quiz.accessibility?.review &&
      currentQuestionIndex < quiz?.questions?.length - 1
    ) {
      nextQuestion();
      setShowAnswerMetric(false);
    } else if (
      !quiz.accessibility?.review &&
      currentQuestionIndex >= quiz?.questions?.length - 1
    ) {
      await openQuizResult();
    } else {
      showMetric();
    }
  }

  function toggleJoiningAttempt() {
    setIsJoiningAttempt((p) => !p);
  }
  // console.log("trhh", isOptionSelected);

  const currentParticipants = useMemo(() => {
    if (Array.isArray(actualQuiz?.quizParticipants)) {
      const filteredParticipants = actualQuiz?.quizParticipants?.filter((v) => {
        const quizStartTime = new Date(actualQuiz?.liveMode?.startingAt);
        const joinedAt = new Date(v?.joinedAt);
        return isAfter(joinedAt, quizStartTime);
      });

      return filteredParticipants;
    } else return [];
  }, [actualQuiz]);

  const isImageOption = useMemo(() => {
    if (currentQuestion) {
      return currentQuestion?.options?.some((opt) => (opt?.option as string)?.startsWith('https://'))
    }
    else return false
  },[currentQuestion])


  return (
    <>
      <div
        className={cn(
          "w-full h-full bg-white relative  text-sm  border-x border-y  col-span-6",
          isLeftBox &&
            isRightBox &&
            !isAttendee &&
            "col-span-6",
          !isLeftBox &&
            !isRightBox &&
            "col-span-full rounded-xl max-w-4xl h-[100vh] sm:h-[78vh] inset-0 absolute m-auto",
          
          isLeftBox && !isRightBox && "",
          !isLeftBox && isRightBox && "rounded-l-xl",
          className
        )}
      >
        <div className={cn("w-full overflow-y-auto no-scrollbar pt-4 px-6 space-y-3  h-[90%] pb-8 ", isAttendee && "pb-[16rem]")}>
          <>
            {transiting ? (
              <Transition
                countDown={actualQuiz?.accessibility?.countDown}
                setShowTransiting={setShowTransiting}
              />
            ) : (
              <>
               
                <TopSection
                  toggleBoard={toggleRightBox}
                  toggleJoiningAttempt={toggleJoiningAttempt}
                  attemptingToJoinIndicator={
                    Array.isArray(liveQuizPlayers) &&
                    liveQuizPlayers?.length > 0
                  }
                  noOfParticipants={String(currentParticipants?.length)}
                  isQuestionView
                  timer={timing}
                  isLeftBox={isLeftBox}
                  isAttendee={isAttendee}
                  playerAvatar={attendeeDetail?.avatar}
                  
                />

                {/** <p className="text-xs sm:text-mobile text-gray-500">{`${
                    currentQuestionIndex + 1
                  }/${quiz?.questions?.length} Questions`}</p> */}
                  <div className="w-full flex flex-col gap-3 max-w-2xl mx-auto">

                 
                <div className="w-full  flex flex-col items-center gap-6">
                  <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
                    {currentQuestionIndex + 1}
                  </p>

                  <div
                    className="innerhtml mx-auto w-fit"
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion?.question ?? "",
                    }}
                  />

                  {currentQuestion?.questionImage ? (
                    <Image
                      className="w-52 sm:w-72 rounded-md h-48 sm:h-52 object-cover"
                      alt="quiz"
                      src={currentQuestion?.questionImage}
                      width={400}
                      height={400}
                    />
                  ) : (
                    <div className="w-1 h-1"></div>
                  )}
                </div>
              

                <div className={cn("w-full", isImageOption && "flex items-center justify-center flex-wrap gap-4")}>
                  {currentQuestion?.options.map((option, index, arr) => (
                    <Option
                      key={index}
                      option={option}
                      isAttendee={isAttendee}
                      setIsOptionSelected={setIsOptionSelected}
                      showAnswerMetric={showAnswerMetric}
                      answer={answer}
                      isImageOption={isImageOption}
                      isDisabled={
                        timing === 0 ||
                        arr?.some(
                          ({ isCorrect }) =>
                            typeof isCorrect === "boolean" || isOptionSelected
                        )
                      }
                    
                      selectOption={selectOption}
                      optionIndex={optionLetter[index]}
                      quiz={quiz}
                    />
                  ))}
                </div>

                <div
                  className={cn(
                    "w-full flex items-start justify-between",
                    (chosenAnswerStatus === null ||
                      !quiz?.accessibility?.showAnswer) &&
                      "items-end justify-end"
                  )}
                >
                  {chosenAnswerStatus !== null &&
                    quiz?.accessibility?.showAnswer && (
                      <div className="flex flex-col items-start justify-start text-mobile">
                        <p
                          className={cn(
                            "text-green-500",
                            !chosenAnswerStatus.isCorrect && "text-red-500"
                          )}
                        >
                          You answered{" "}
                          {chosenAnswerStatus.isCorrect
                            ? "correctly"
                            : "incorrectly"}
                        </p>
                        <p className="font-medium text-sm">{`Correct Answer is ${
                          optionLetter[chosenAnswerStatus.correctOption]
                        }`}</p>
                      </div>
                    )}
                  <p className="self-end bg-basePrimary-200 rounded-3xl text-sm text-basePrimary px-2 py-1">{`${Number(
                    currentQuestion?.points
                  )} ${Number(currentQuestion?.points) > 1 ? `pts` : `pt`}`}</p>
                </div>

                {quiz?.accessibility?.review && (
                  <div
                    className={cn(
                      "block",
                      chosenAnswerStatus === null && "hidden"
                    )}
                  >
                    {showExplanation && (
                      <p className="mb-3 text-xs sm:text-sm text-gray-500">
                        {currentQuestion?.feedBack ?? "No Explanation"}
                      </p>
                    )}
                    <button
                      onClick={toggleExplanationVisibility}
                      className="text-xs sm:text-sm text-basePrimary underline"
                    >
                      {showExplanation
                        ? "Hide Explanation"
                        : "Show Explanation"}
                    </button>
                  </div>
                )}
                 </div>

             {/* <div className="w-full hidden items-end justify-between">
              <div className="flex items-center gap-x-2">
                <Button
                  onClick={previousQuestion}
                  className={cn(
                    "text-basePrimary w-[95px] border border-basePrimary hover:text-gray-50 bg-white hover:bg-basePrimary gap-x-2 h-10 font-medium hidden",
                    currentQuestionIndex > 0 && "flex"
                  )}
                >
                  <p>Previous</p>
                </Button>
                <Button
                  onClick={nextQuestion}
                  className={cn(
                    "text-gray-50 w-[95px] bg-basePrimary gap-x-2 h-10 font-medium hidden",
                    currentQuestionIndex < quiz?.questions?.length && "flex"
                  )}
                >
                  <p>Next</p>
                </Button>
              </div>

              <p className="w-1 h-1"></p>
            </div> */}
         

                <div className="w-full rounded-b-xl flex flex-col items-center justify-center mx-auto absolute inset-x-0 bottom-0 gap-y-3  bg-white py-2">
                {!quiz?.accessibility?.live &&
                  isAttendee && (
                    <Button
                      disabled={loading || isUpdating} //
                      onClick={onNextBtnClick}
                      className="text-gray-50  mx-auto w-[180px] my-4 bg-[#001fcc] gap-x-2 h-11 font-medium flex"
                    >
                      {isUpdating && (
                        <LoaderAlt size={22} className="animate-spin" />
                      )}
                      <p>Next </p>
                    </Button>
                  )}
                  {quiz.branding.poweredBy && (
                    <Link 
                    href="/"
                    target="_blank"
                    className="text-center bg-white text-xs sm:text-sm w-full  p-2 ">
                      Create your Quiz with Zikoro
                    </Link>
                  )}

                 {!isAttendee && <Button
                    onClick={toggleLeftBox}
                    className={cn(
                      "absolute bottom-1 left-1",
                    
                    )}
                  >
                    <Maximize2 size={20} />
                  </Button>}
                </div>
              </>
            )}
          </>
        </div>
      </div>
      {isJoiningAttempt && (
        <JoiningAttemptTab
          liveQuizPlayers={liveQuizPlayers}
          close={toggleJoiningAttempt}
          quiz={actualQuiz}
          refetchLobby={getLiveParticipant}
          refetch={refetchQuiz}
          currentParticipants={currentParticipants}
        />
      )}
    </>
  );
})

function Transition({
  setShowTransiting,
  countDown,
}: {
  setShowTransiting: React.Dispatch<React.SetStateAction<boolean>>;
  countDown: number;
}) {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setSecondsLeft((prevMilliseconds) => {
        if (prevMilliseconds <= 1) {
          setShowTransiting(false);
          clearInterval(countdownInterval);
          return 0;
        }
        return prevMilliseconds - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [secondsLeft]);

  return (
    <div className="w-full h-full flex items-center flex-col gap-[40%] ">
      <p className="font-semibold text-base sm:text-xl  ">Next question</p>
      <div className="w-[170px] h-[170px]">
        <CircularProgressbar
          styles={buildStyles({
            pathColor: "#001fcc",
            trailColor: "#e5e7eb",
            textColor: "black",
            textSize: "50px",
          })}
          strokeWidth={3}
          minValue={0}
          maxValue={countDown}
          value={secondsLeft}
          text={`${secondsLeft === 0 ? "GO" : secondsLeft}`}
        />
      </div>
    </div>
  );
}
