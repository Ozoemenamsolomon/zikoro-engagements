"use client";

import { Button } from "@/components/custom";
import {
  AnalyticsIcon,
  EmptyQuizQuestionIcon,
  SettingsIcon,
  SmallPreviewIcon,
  SmallShareIcon,
} from "@/constants";
import { useGetData, usePostRequest } from "@/hooks/services/requests";
import {
  TEngagementFormAnswer,
  TEngagementFormQuestion,
  TFormattedEngagementFormAnswer,
} from "@/types/form";
import { TOrganization } from "@/types/home";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddedFormQuestions } from "./addedFormQuestions";
import { cn } from "@/lib/utils";
import { EngagementLayout } from "../../_components";
import { AddQuestion } from "./addQuestion";
import { LeadingHeadRoute, TrailingHeadRoute } from "../../quiz/_components";
import { MdNavigateBefore } from "react-icons/md";
import { FormSettings } from "../formSettings/FormSettings";
import { LoadingState } from "@/components/composables/LoadingState";
import FormResponses from "../formResponse/FormResponse";
import { ShareEngagement } from "../../_components/ShareEngagement";

export default function AddFormQuestions({
  formId,
  workspaceAlias,
}: {
  formId: string;
  workspaceAlias: string;
}) {
  const router = useRouter();
  const { data, isLoading, getData } = useGetData<TEngagementFormQuestion>(
    `engagements/form/${formId}`
  );
  const [isShare, setIsShare]  = useState(false)
  const [flattenedResponse, setFlattenedResponse] = useState<
    TFormattedEngagementFormAnswer[]
  >([]);
  const [question, setQuestion] = useState<
    TEngagementFormQuestion["questions"][number] | null
  >(null);
  const { data: formResponses } = useGetData<TEngagementFormAnswer[]>(
    `/engagements/form/answer/${formId}`
  );
  const [active, setActive] = useState(0);
  const [isAddNew, setIsAddNew] = useState(false);
  const [isToggleSetting, setToggleSetting] = useState(false);
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );
  const { postData } =
    usePostRequest<TEngagementFormQuestion>("engagements/form");

  function editQuestion(
    q: TEngagementFormQuestion["questions"][number] | null
  ) {
    setQuestion(q);
  }

  function toggleSetting() {
    setToggleSetting((prev) => !prev);
  }

  const formattedResponses = useMemo(() => {
    const responseGroup: { [key: string]: TFormattedEngagementFormAnswer[] } =
      {};

    if (Array.isArray(formResponses) && formResponses?.length > 0 && data) {
      const newData: TFormattedEngagementFormAnswer[] = formResponses?.flatMap(
        (v) => {
          return v?.responses?.map((item) => {
            const { responses, ...restData } = v;
            return {
              ...item,
              ...restData,
              question:
                data?.questions?.find((q) => q.questionId === item?.questionId)
                  ?.question || "",
              questionImage:
                data?.questions?.find((q) => q?.questionId === item?.questionId)
                  ?.questionImage || null,
              optionFields:
                data?.questions?.find((q) => q?.questionId === item?.questionId)
                  ?.optionFields || null,
            };
          });
        }
      );

      setFlattenedResponse(newData);

      newData?.forEach((quest) => {
        const key = quest?.questionId;
        if (!responseGroup[key]) {
          responseGroup[key] = [] as TFormattedEngagementFormAnswer[];
        }
        responseGroup[key].push(quest);
      });

      return responseGroup;
    }
  }, [data, formResponses]);

  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <>
      {active === 0 && (
        <>
          <div className="w-screen min-h-screen fixed z-10 inset-0 sm:px-4  mx-auto">
            {(!data?.questions ||
              (Array.isArray(data?.questions) &&
                data?.questions?.length === 0)) &&
            !isAddNew ? (
              <EmptyQuestion addNewQuestion={() => setIsAddNew(true)} />
            ) : (
              <div className="w-full h-full gap-4 sm:pt-4 items-start grid grid-cols-12">
                {(isAddNew ||
                  question !== null ||
                  (Array.isArray(data?.questions) &&
                    data?.questions?.length > 0)) &&
                  data && (
                    <AddedFormQuestions
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
                        name={data?.title ?? ""}
                        Icon={MdNavigateBefore}
                      />
                    }
                    TrailingWidget={
                      <TrailingHeadRoute
                        as="button"
                        Icon={SettingsIcon}
                        title="Form Settings"
                        onClick={() => {
                          setToggleSetting(true);
                        }}
                      />
                    }
                    // CenterWidget={
                    //   <TrailingHeadRoute
                    //     as="button"
                    //     Icon={SettingsIcon}
                    //     title="Form Response"
                    //     onClick={() => {}}
                    //   />
                    // }
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
                          engagementForm={data}
                          workspaceAlias={workspaceAlias}
                          key={question?.questionId}
                        />
                      )}
                  </EngagementLayout>
                </div>
              </div>
            )}
          </div>
          <div className="w-full bg-white fixed bottom-0 border-t inset-x-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              {/* <Button
                // onClick={() =>
                //   router.push(
                //     `/e/${workspaceAlias}/quiz/o/${quizId}/presentation?type=preview`
                //   )
                // }
                // disabled={isDisabled}
                className="gap-x-2 bg-basePrimary-200  border-basePrimary border  rounded-xl h-9"
              >
                <SmallPreviewIcon />
                <p className="bg-basePrimary hidden sm:block  gradient-text">
                  {" "}
                  Preview Mode
                </p>
              </Button> */}
              <Button
                onClick={() => setActive(1)}
                
                className="gap-x-2 bg-basePrimary-200  border-basePrimary border  rounded-xl h-9"
              >
                <AnalyticsIcon />
                <p className="bg-basePrimary hidden sm:block  gradient-text">
                  {" "}
                 Form Response
                </p>
              </Button>
            </div>

            <div className="flex items-center  gap-x-2">
              {/* <Button
             
              disabled={isDisabled}
              className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
            >
              <PresentQuizzIcon />
              <p className="bg-basePrimary  gradient-text">Present</p>
            </Button> */}
              <Button
              onClick={() => setIsShare(true)}
                className="gap-x-2 bg-basePrimary-200 border-basePrimary border  rounded-xl h-9"
              >
                <SmallShareIcon />
                <p className="bg-basePrimary hidden sm:block gradient-text">
                  Collect Responses
                </p>
              </Button>
            </div>
          </div>
        </>
      )}
      {isToggleSetting && data && organization && (
        <FormSettings
          close={toggleSetting}
          engagementForm={data}
          refetch={getData}
          organization={organization}
        />
      )}
      {active === 1 && (
        <FormResponses
          data={formattedResponses}
          formAlias={formId}
          flattenedResponse={flattenedResponse}
          setActive={setActive}
          coverTitle={data?.title}
          questionLength={data?.questions?.length || 0}
          questions={data?.questions|| []}
        />
      )}
       {isShare && (
        <ShareEngagement
          urlLink={`https://engagements.zikoro.com/e/${data?.workspaceAlias}/form/a/${data?.formAlias}`}
          title={data?.title}
          close={() => setIsShare(false)}
        />
      )}
      {/**https://engagements.zikoro.com/e/pPdselJxWSFKfkP5pYlv/form/a/VXPH3R */}
    </>
  );
}

function EmptyQuestion({ addNewQuestion }: { addNewQuestion: () => void }) {
  return (
    <div className="w-full min-h-screen bg-white rounded-lg p-4 sm:p-6 flex items-center justify-center flex-col gap-5">
      <EmptyQuizQuestionIcon />
      <h2 className="font-semibold text-base sm:text-lg mt-5">
        Your Form is Empty
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
