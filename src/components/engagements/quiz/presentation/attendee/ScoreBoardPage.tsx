"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { TAnswer, TQuestion, TQuiz, TRefinedQuestion } from "@/types/quiz";
import { ScoreBoard } from "../common/ScoreBoard";
import { useGetData } from "@/hooks/services/requests";
import { useGetQuizAnswer } from "@/hooks/services/quiz";

export default function ScoreBoardPage({ quizId }: { quizId: string }) {
  const { answers, getAnswers } = useGetQuizAnswer();
  const { data: actualQuiz } = useGetData<TQuiz<TQuestion[]>>(
    `engagements/quiz/${quizId}`
  );
  const params = useSearchParams();
  const id = params.get("id");

  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (actualQuiz) {
        await getAnswers(actualQuiz?.id);
      }
    })();
  }, [actualQuiz]);

  const quiz: TQuiz<TRefinedQuestion[]> | null = useMemo(() => {
    if (actualQuiz) {
      const attemptedQuiz = actualQuiz?.quizParticipants?.find(
        (participant) => participant?.id === id
      )?.attemptedQuiz;

      return attemptedQuiz!;
    } else {
      return null;
    }
  }, [actualQuiz, id]);

  function goBack() {
    if (actualQuiz)
      router.push(`/quiz/${actualQuiz?.eventAlias}/present/${quizId}`);
  }

  console.log("actual", actualQuiz, quiz, id);

  return (
    <>
      <ScoreBoard
        answers={answers}
        close={goBack}
        quiz={quiz}
        id={id as string}
        isAttendee={true}
        actualQuiz={actualQuiz}
      />
    </>
  );
}
