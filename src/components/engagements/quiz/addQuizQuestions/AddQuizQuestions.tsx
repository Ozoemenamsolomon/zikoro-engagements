"use client";

import {
  AnalyticsIcon,
  EmptyQuizQuestionIcon,
  PeopleIcon,
  PlayQuizIcon,
  PresentQuizzIcon,
  SettingsIcon,
  SmallPreviewIcon,
  SmallShareIcon,
} from "@/constants";
import { deploymentUrl } from "@/utils";
import { EngagementLayout } from "../../_components/EngagementLayout";
import { Button } from "@/components/custom";
import { LeadingHeadRoute, TrailingHeadRoute } from "../_components";
import { useGetData, usePostRequest } from "@/hooks/services/requests";
import { LoadingState } from "@/components/composables/LoadingState";
import { TQuestion, TQuiz } from "@/types/quiz";
import { AddQuestion } from "./AddQuestion";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AddedQuestions } from "./AddedQuestion";
import { TOrganization } from "@/types/home";
import { QuizSettings } from "../quizSettings/QuizSettings";
import { MdNavigateBefore } from "react-icons/md";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ShareEngagement } from "./_components";

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
  const [accessibility, setAccessibility] = useState(data?.accessibility);
  const { postData } = usePostRequest<TQuiz<TQuestion[]>>("engagements/quiz");
  const [updatingMode, setUpdatingMode] = useState(false);
  const [isShare, setIsShare] = useState(false);

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

  useEffect(() => {
    if (data !== null && Array.isArray(data?.questions)) {
      editQuestion(data?.questions[0]);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setAccessibility(data?.accessibility);
    }
  }, [data]);

  async function updateMode() {
    setAccessibility({
      ...accessibility,
      live: !accessibility.live,
    });
    setUpdatingMode(true);
    await postData({
      payload: {
        ...data,
        accessibility: {
          ...accessibility,
          live: !accessibility.live,
        },
      },
    });
    setUpdatingMode(false);
  }
  // console.log(data);

  function onShare() {
    setIsShare((prev) => !prev);
  }

  //console.log(isAddNew);

  const isQuiz = useMemo(() => {
    return data?.interactionType === "quiz";
  }, [data]);

  console.log(data?.interactionType)

  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <>
      <div className="w-screen min-h-screen fixed z-10 inset-0 sm:px-4  mx-auto ">
        {(!data?.questions ||
          (Array.isArray(data?.questions) && data?.questions?.length === 0)) &&
        !isAddNew ? (
          <EmptyQuestion addNewQuestion={() => setIsAddNew(true)} />
        ) : (
          <div className="w-full h-full gap-4 sm:pt-4 items-start grid grid-cols-12">
            {(isAddNew ||
              question !== null ||
              (Array.isArray(data?.questions) &&
                data?.questions?.length > 0)) &&
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
                "w-full col-span-9 h-full",
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
                (question !== null || isAddNew) &&
                  "block col-span-full sm:col-span-9"
              )}
            >
              <EngagementLayout
                className=" w-full vert-scroll overflow-y-auto pb-32"
                parentClassName={cn(
                  "  relative px-0 h-full",
                  question === null && "hidden sm:block",
                  isAddNew && "block"
                )}
                LeadingWidget={
                  <LeadingHeadRoute
                    onClick={() => {
                      setIsAddNew(false);
                      editQuestion(null);
                    }}
                    name={data?.coverTitle ?? ""}
                    Icon={MdNavigateBefore}
                  />
                }
                TrailingWidget={
                  <TrailingHeadRoute
                    as="button"
                    Icon={SettingsIcon}
                    title={`${data?.interactionType === 'quiz'? "Quiz":"Poll"} Settings`}
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
                      interactionType={data?.interactionType}
                      workspaceAlias={workspaceAlias}
                      key={question?.id}
                    />
                  )}
              </EngagementLayout>
            </div>
          </div>
        )}
      </div>
      <div className="w-full bg-white fixed bottom-0 border-t inset-x-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            onClick={() =>
              router.push(
                `/e/${workspaceAlias}/${
                  isQuiz ? "quiz" : "poll"
                }/o/${quizId}/presentation?type=preview`
              )
            }
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
            onClick={() => {
              router.push(
                `/e/${workspaceAlias}/${
                  isQuiz ? "quiz" : "poll"
                }/o/${quizId}/analytics`
              );
            }}
            disabled={isDisabled}
            className="gap-x-2 bg-basePrimary-200  border-basePrimary border  rounded-xl h-9"
          >
            <AnalyticsIcon />
            <p className="bg-basePrimary hidden sm:block  gradient-text">
              {" "}
              Analytics
            </p>
          </Button>
        </div>

        <Button
          onClick={() =>
            router.push(
              `/e/${workspaceAlias}/${
                isQuiz ? "quiz" : "poll"
              }/o/${quizId}/presentation`
            )
          }
          disabled={isDisabled}
          className="rounded-full h-fit sm:bg-basePrimary-200 px-2 sm:border border-basePrimary gap-x-2"
        >
          <PlayQuizIcon />
          <p className="bg-basePrimary hidden sm:block text-sm sm:text-base gradient-text">
            Start {isQuiz ? "Quiz" : "Poll"}
          </p>
        </Button>

        <div className="flex items-center  gap-x-2">
          {isQuiz && (
            <Button
              onClick={() => {
                router.push(
                  `/e/${workspaceAlias}/quiz/a/${quizId}/leaderboard?type=o`
                );
              }}
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
          )}
          {/* <Button
             
              disabled={isDisabled}
              className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
            >
              <PresentQuizzIcon />
              <p className="bg-basePrimary  gradient-text">Present</p>
            </Button> */}
          <Button
            onClick={onShare}
            disabled={isDisabled}
            className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
          >
            <SmallShareIcon />
            <p className="bg-basePrimary hidden sm:block gradient-text">
              Share
            </p>
          </Button>
          {data && accessibility && (
            <div className="hidden text-sm sm:flex items-center gap-x-1">
              <Switch
                disabled={updatingMode}
                // disabled={organization && organization?.subscriptionPlan === "Free"}
                checked={accessibility.live}
                onClick={() => updateMode()}
                className=""
              />
              <p
                className={cn(
                  "",
                  accessibility?.live && "gradient-text bg-basePrimary"
                )}
              >
                Live Mode
              </p>
            </div>
          )}
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

      {isShare && data && (
        <ShareEngagement
          title={data?.coverTitle}
          urlLink={
            data?.interactionType === "poll"
              ? `https://engagements.zikoro.com/e/${data?.workspaceAlias}/poll/a/${data?.quizAlias}/presentation`
              : `https://engagements.zikoro.com/e/${data?.workspaceAlias}/quiz/a/${data?.quizAlias}/presentation`
          }
          close={onShare}
        />
      )}
    </>
  );
}

function EmptyQuestion({ addNewQuestion }: { addNewQuestion: () => void }) {
  return (
    <div className="w-full min-h-screen bg-white rounded-lg p-4 sm:p-6 flex items-center justify-center flex-col gap-5">
      <EmptyQuizQuestionIcon />
      <h2 className="font-semibold text-base sm:text-lg mt-5">No Question`</h2>
      <Button
        onClick={addNewQuestion}
        className="bg-basePrimary h-11 text-white font-medium"
      >
        Add Question
      </Button>
    </div>
  );
}
