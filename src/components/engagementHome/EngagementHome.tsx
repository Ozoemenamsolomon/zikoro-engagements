"use client";

import { useGetUserEngagements } from "@/hooks/services/engagement";
import { FormCard } from "../engagements/form/card/FormCard";
import { QuizCard } from "../engagements/quiz/card/QuizCard";
import { QaCard } from "../engagements/qa/card/QaCard";
import { EngagementEmptyState } from "../dashboard/Dashboard";

export default function EngagementHome() {
  const {
    qas,
    qaLoading,
    quizLoading,
    quizzes,
    getQas,
    getQuizzes,
    getForm,
    forms,
    formLoading,
  } = useGetUserEngagements();
  return (
    <div className="w-full mx-auto max-w-7xl ">
      <div className="w-full mt-8 sm:mt-10 flex items-center justify-between gap-x-2 mb-4 sm:mb-6">
        <h2 className="font-semibold text-base sm:text-lg">Engagements</h2>
      </div>

      {qaLoading || quizLoading || formLoading ? (
        <EngagementEmptyState />
      ) : (
        <div className="w-full grid h-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {!qaLoading &&
            !quizLoading &&
            !formLoading &&
            forms?.length === 0 &&
            qas?.length === 0 &&
            quizzes?.length === 0 && (
              <div className="w-full h-[200px] flex items-center justify-center">
                <h2 className="font-medium text-lg">
                  Your Engagements will appear here
                </h2>
              </div>
            )}
          {Array.isArray(quizzes) &&
            quizzes.map((quiz, index) => (
              <QuizCard refetch={getQuizzes} key={index} quiz={quiz} />
            ))}
          {Array.isArray(qas) &&
            qas.map((qa, index) => (
              <QaCard key={index} qa={qa} refetch={getQas} />
            ))}
          {Array.isArray(forms) &&
            forms.map((form, index) => (
              <FormCard key={index} form={form} refetch={getForm} />
            ))}
        </div>
      )}
    </div>
  );
}
