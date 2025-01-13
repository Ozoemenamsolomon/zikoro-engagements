"use client";

import { useGetData } from "@/hooks/services/requests";
import { TOrganization } from "@/types/home";
import { TQuestion, TQuiz } from "@/types/quiz";
import { Button } from "@/components/custom";
import {
  FullScreenIcon,
  NextQuestionIcon,
  PlayQuizIcon,
  SpeakerIcon,
} from "@/constants";

export default function QuizOrganizerView({
  quizId,
  workspaceAlias,
}: {
  quizId: string;
  workspaceAlias: string;
}) {
  const { data, isLoading, getData } = useGetData<TQuiz<TQuestion[]>>(
    `engagements/quiz/${quizId}`
  );
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );

  return (
    <div className="w-full min-h-screen px-4  mx-auto  flex flex-col justify-between">
      <div className="w-full h-[75vh] gap-4 mt-10 items-start grid grid-cols-12">
        
      </div>

      <div className="w-full flex items-center gap-x-3 justify-center py-4">
        <div className="w-fit rounded-3xl bg-white border p-2">
          <Button className="rounded-3xl h-fit bg-basePrimary-200 px-2 border border-basePrimary gap-x-2">
            <PlayQuizIcon />
            <p className="bg-basePrimary text-sm sm:text-base gradient-text">
              Start Quiz
            </p>
          </Button>
          <Button className="px-0 w-fit h-fit">
            <NextQuestionIcon />
          </Button>
          <Button className="px-0 w-fit h-fit">
            <SpeakerIcon />
          </Button>
          <Button className="px-0 w-fit h-fit">
            <FullScreenIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
