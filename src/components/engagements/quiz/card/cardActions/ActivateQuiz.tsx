"use client";

import { Switch } from "@/components/ui/switch";
import { usePostRequest } from "@/hooks/services/requests";
import { TOrganizationQuiz, TQuestion, TQuiz } from "@/types/quiz";

export function ActivateQuiz({
  quiz,
  refetch,
}: {
  refetch: () => Promise<any>;
  quiz: TOrganizationQuiz;
}) {
  const {postData: updateQuiz, isLoading } = usePostRequest('engagements/quiz');
  async function updateStatus() {
    const {organization, ...restData}= quiz
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...restData,
      accessibility: {
        ...quiz?.accessibility,
        disable: !quiz.accessibility?.disable,
      },
    };

    await updateQuiz({ payload });
    refetch();
  }
  return (
    <>
      <div className="w-full px-4 text-xs flex items-center justify-between ">
        <p>Disabled</p>
        <Switch
          onClick={updateStatus}
          checked={quiz.accessibility?.disable}
          disabled={isLoading}
          className="data-[state=unchecked]:bg-gray-200 data-[state=checked]:bg-basePrimary"
        />
      </div>
    </>
  );
}
