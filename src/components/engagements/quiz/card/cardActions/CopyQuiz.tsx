"use client";

import { Button } from "@/components/custom";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { TQuiz, TQuestion, TOrganizationQuiz } from "@/types/quiz";
import { generateInteractionAlias } from "@/utils";
import { usePostRequest } from "@/hooks/services/requests";
export function CopyQuiz({
  quiz,
  refetch,
}: {
  quiz: TOrganizationQuiz;
  refetch: () => Promise<any>;
}) {
  const { postData: createQuiz, isLoading } = usePostRequest('engagements/quiz');

  async function coppied() {
    const {id, organization, ...restData} = quiz
    const newAlias = generateInteractionAlias();

    const payload = {
      ...restData,
      quizAlias: newAlias,
    };

    await createQuiz({ payload });
    refetch();
  }
  return (
    <>
      <Button
      disabled={isLoading}
        onClick={coppied}
        className={
          "items-center h-10 gap-x-2 hover:bg-gray-100 justify-start w-full  text-xs"
        }
      >
        {isLoading && <LoaderAlt size={12} className="animate-spin" />}
        <span>Make a Copy</span>
      </Button>
    </>
  );
}
