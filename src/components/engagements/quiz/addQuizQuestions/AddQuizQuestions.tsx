"use client";

import {
  EmptyQuizQuestionIcon,
  PeopleIcon,
  PlayQuizIcon,
  PresentQuizzIcon,
  SettingsIcon,
  SmallPreviewIcon,
  SmallShareIcon,
} from "@/constants";
import { QuizLayout } from "../_components/QuizLayout";
import { Button } from "@/components/custom";
import { LeadingHeadRoute, TrailingHeadRoute } from "../_components";
import { useGetData } from "@/hooks/services/requests";
import { LoadingState } from "@/components/composables/LoadingState";
import { TQuestion, TQuiz } from "@/types/quiz";
import { AddQuestion } from "./AddQuestion";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AddedQuestions } from "./AddedQuestion";
import { TOrganization } from "@/types/home";
import { QuizSettings } from "../quizSettings/QuizSettings";
import {MdNavigateBefore} from "react-icons/md"
import { useRouter } from "next/navigation";

export default function AddQuizQuestions({
  quizId,
  workspaceAlias,
}: {
  quizId: string;
  workspaceAlias: string;
}) {
  const router = useRouter();
  const { data, isLoading, getData } = useGetData<TQuiz<TQuestion[]>>(
    `engagements/quiz/${quizId}`
  );
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );
  const [question, setQuestion] = useState<TQuestion | null>(null);
  const [isAddNew, setIsAddNew] = useState(false);
  const [isToggleSetting, setToggleSetting] = useState(false);

  function editQuestion(q: TQuestion | null) {
    setQuestion(q);
  }

  const isDisabled = useMemo(() => {
    if (data) {
      return (
        data?.questions === null ||
        (Array.isArray(data?.questions) && data?.questions?.length === 0)
      );
    } else return true;
  }, [data]);

  function toggleSetting() {
    setToggleSetting((prev) => !prev);
  }

  console.log(question === null || !isAddNew)


  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <>
      <div className="w-full min-h-screen sm:px-4  mx-auto  flex flex-col justify-between">
        <div className="w-full h-[90vh] sm:h-[83vh] gap-4 sm:mt-10 items-start grid grid-cols-12">
          {(isAddNew ||
            question !== null ||
            (Array.isArray(data?.questions) && data?.questions?.length > 0)) &&
            data && (
              <AddedQuestions
                questions={data?.questions}
                editQuestion={editQuestion}
                editingQuestion={question}
                addNewQuestion={() => {
                  setIsAddNew(true);
                  editQuestion(null);
                }}
                isAddNew={isAddNew}
              />
            )}

          <div
            className={cn(
              "w-full col-span-9",
              (!data?.questions ||
                (Array.isArray(data?.questions) &&
                  data?.questions?.length === 0)) &&
                "col-span-full",
              (isAddNew ||
                question !== null ||
                (Array.isArray(data?.questions) &&
                  data?.questions?.length > 0)) &&
                data &&
                "col-span-9",
              (question !== null || isAddNew) && "block col-span-full sm:col-span-9"
            )}
          >
            <QuizLayout
              className="overflow-y-auto"
              parentClassName={cn(
                "h-[83vh] relative px-0",
                question === null && "hidden sm:block",
                isAddNew && "block"
              )}
              LeadingWidget={<LeadingHeadRoute onClick={() => {
                setIsAddNew(false)
                editQuestion(null)
              }} name={data?.coverTitle ?? ""} Icon={MdNavigateBefore} />}
              TrailingWidget={
                <TrailingHeadRoute
                  as="button"
                  Icon={SettingsIcon}
                  title="Quiz Settings"
                  onClick={toggleSetting}
                />
              }
            >
              {(isAddNew ||
                question !== null ||
                (Array.isArray(data?.questions) &&
                  data?.questions?.length > 0)) &&
                data && (
                  <AddQuestion
                    refetch={getData}
                    editQuestion={editQuestion}
                    question={question}
                    quiz={data}
                    interactionType="quiz"
                    workspaceAlias={workspaceAlias}
                    key={question?.id}
                  />
                )}
              {(!data?.questions ||
                (Array.isArray(data?.questions) &&
                  data?.questions?.length === 0)) &&
                !isAddNew && (
                  <EmptyQuestion addNewQuestion={() => setIsAddNew(true)} />
                )}
            </QuizLayout>
          </div>
        </div>
        <div className="w-full bg-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button
            disabled={isDisabled}
            className="gap-x-2 bg-basePrimary-200  border-basePrimary border  rounded-xl h-9"
          >
            <SmallPreviewIcon />
            <p className="bg-basePrimary hidden sm:block  gradient-text">
              {" "}
              Preview Mode
            </p>
          </Button>

          <Button
            onClick={() =>
              router.push(`/e/${workspaceAlias}/quiz/o/${quizId}/presentation`)
            }
            disabled={isDisabled}
            className="rounded-full h-fit sm:bg-basePrimary-200 px-2 sm:border border-basePrimary gap-x-2"
          >
            <PlayQuizIcon />
            <p className="bg-basePrimary hidden sm:block text-sm sm:text-base gradient-text">
              Start Quiz
            </p>
          </Button>

          <div className="flex items-center  gap-x-2">
            <Button
              disabled={isDisabled}
              className="gap-x-2 bg-basePrimary-200 px-2 hidden sm:flex border-basePrimary border  rounded-xl h-9"
            >
              <PeopleIcon />
              <p className="bg-basePrimary gradient-text">
                {Array.isArray(data?.quizParticipants)
                  ? data?.quizParticipants?.length
                  : "0"}
              </p>
            </Button>
            {/* <Button
             
              disabled={isDisabled}
              className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
            >
              <PresentQuizzIcon />
              <p className="bg-basePrimary  gradient-text">Present</p>
            </Button> */}
            <Button
              disabled={isDisabled}
              className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
            >
              <SmallShareIcon />
              <p className="bg-basePrimary hidden sm:block gradient-text">
                Share
              </p>
            </Button>
          </div>
        </div>
      </div>
      {isToggleSetting && data && organization && (
        <QuizSettings
          close={toggleSetting}
          quiz={data}
          refetch={getData}
          organization={organization}
        />
      )}
    </>
  );
}

function EmptyQuestion({ addNewQuestion }: { addNewQuestion: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-5">
      <EmptyQuizQuestionIcon />
      <h2 className="font-semibold text-base sm:text-lg mt-5">
        Your Quiz is Empty
      </h2>
      <Button
        onClick={addNewQuestion}
        className="bg-basePrimary h-11 text-white font-medium"
      >
        Add Question
      </Button>
    </div>
  );
}
