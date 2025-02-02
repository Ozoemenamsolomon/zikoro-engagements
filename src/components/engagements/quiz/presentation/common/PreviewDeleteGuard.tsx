"use client";
import { TQuestion, TQuiz } from "@/types/quiz";
import { useEffect } from "react";

export default function PreviewDeletionGuard({ quiz }: { quiz: TQuiz<TQuestion[]> }) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const isParticipantPresent = quiz?.quizParticipants?.some((v) =>
        v?.nickName.includes("@P")
      );

      if (isParticipantPresent) {
        const payload = {
          ...quiz,
          quizParticipants: quiz?.quizParticipants?.filter(
            (v) => !v?.nickName?.toLowerCase().includes("@p")
          ),
        };
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/engagements/quiz", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quiz]);

  return null;
}