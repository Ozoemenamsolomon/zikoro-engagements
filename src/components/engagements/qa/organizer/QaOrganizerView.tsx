"use client";

import { Button } from "@/components/custom/Button";
import {
  AllQuestions,
  MyQuestions,
  TopSection,
  AskandReplyModal,
} from "../_components";
import { useState, useEffect, useMemo } from "react";
import { Plus } from "styled-icons/bootstrap";
import { Minimize2 } from "styled-icons/feather";
import { AwaitingReview, QaAdvert } from "./_components";
import { cn } from "@/lib/utils";
import { useGetQAQuestions, useQARealtimePresence } from "@/hooks/services/qa";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { createClient } from "@/utils/supabase/client";
import { TQa, TQAQuestion } from "@/types/qa";
import { useGetData, usePostRequest } from "@/hooks/services/requests";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";
import { AnalyticsIcon, PlayQuizIcon, SmallShareIcon } from "@/constants";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { ActionModal } from "@/components/custom/ActionModal";
import { ShareEngagement } from "../../_components/ShareEngagement";
import { useRouter } from "next/navigation";

const supabase = createClient();
export default function QaOrganizerView({
  workspaceAlias,
  qaId,
}: {
  workspaceAlias: string;
  qaId: string;
}) {
  const [active, setActive] = useState(1);
  const { data: organization } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isRightBox, setIsRightBox] = useState(true);
  const [isLeftBox, setIsLeftBox] = useState(true);
  const [isShare, setIsShare] = useState(false);
  const [isStopQuestion, setIsStopQuestion] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const { user } = useUserStore();
  const [filterValue, setFilterValue] = useState("Recent");
  const [tagValue, setTagValue] = useState("");
  const router = useRouter()
  const { postData } = usePostRequest<Partial<TQa>>("/engagements/qa");
  const { data: qa, getData } = useGetData<TQa>(
    `/engagements/qa/${qaId}`,
    true,
    null,
    true
  );
  const [replyQuestion, setReplyQuestion] = useState<TQAQuestion | null>(null);
  const { eventQAQuestions, setEventQAQuestions, isLoading, getQAQUestions } =
    useGetQAQuestions({ qaId });
  useQARealtimePresence(qa?.accessibility?.live);

  useEffect(() => {
    if (!qa?.accessibility?.live) return;

    // Create a single channel for the "live-quiz"
    const channel = supabase.channel("live-quiz");

    // Listen for UPDATE events
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "QandAQuestions",
        filter: `QandAAlias=eq.${qaId}`,
      },
      (payload) => {
        // console.log("payload from live UPDATE", payload);
        const updated = payload.new as TQAQuestion;
        if (Array.isArray(eventQAQuestions)) {
          // console.log("over  here at questz");
          const updatedQuestions = eventQAQuestions.map((item) => {
            console.log("rre", item.questionAlias === updated.questionAlias);
            if (item.questionAlias === updated.questionAlias) {
              return { ...updated };
            }
            return item;
          });
          // console.log("over  here at quest");
          setEventQAQuestions(updatedQuestions);
          // console.log("e",replyQuestion, replyQuestion?.questionAlias, updated.questionAlias)
          if (
            replyQuestion !== null &&
            replyQuestion?.questionAlias === updated.questionAlias
          ) {
            // console.log("over  here at reply");
            setReplyQuestion(updated);
          }
        }
      }
    );

    // Listen for INSERT events
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "QandAQuestions",
        filter: `QandAAlias=eq.${qaId}`,
      },
      (payload) => {
        // console.log("payload from live INSERT", payload);
        if (Array.isArray(eventQAQuestions)) {
          setEventQAQuestions([
            ...eventQAQuestions,
            payload.new as TQAQuestion,
          ]);
        }
      }
    );

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log("Subscription status:", status);
    });

    return () => {
      // Cleanup the channel on unmount
      supabase.removeChannel(channel);
    };
  }, [supabase, qa, eventQAQuestions, replyQuestion]);

  function setActiveState(n: number) {
    setActive(n);
  }

  function onShowQuestionModal() {
    setIsOpen((p) => !p);
  }

  const filteredEventQaQuestions = useMemo(() => {
    if (Array.isArray(eventQAQuestions)) {
      if (filterValue === "Recent") {
        const filtered = eventQAQuestions
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .filter((v) => {
            const isPresent =
              Array.isArray(v?.tags) && tagValue
                ? v?.tags?.some((t) => t?.name === tagValue)
                : true;

            return v?.questionStatus !== "pending" && isPresent;
          });

        const pinnedQuestion = filtered.filter((q) => q?.isPinned);
        const unpinnedQuestion = filtered?.filter((q) => !q?.isPinned);

        return [...pinnedQuestion, ...unpinnedQuestion];
      } else if (filterValue === "Top Liked") {
        const filtered = eventQAQuestions
          .sort((a, b) => b.vote - a.vote)
          .filter((v) => {
            const isPresent =
              Array.isArray(v?.tags) && tagValue
                ? v?.tags?.some((t) => t?.name === tagValue)
                : true;

            return v?.questionStatus !== "pending" && isPresent;
          });

        const pinnedQuestion = filtered.filter((q) => q?.isPinned);
        const unpinnedQuestion = filtered?.filter((q) => !q?.isPinned);

        return [...pinnedQuestion, ...unpinnedQuestion];
      }
    } else return [];
  }, [eventQAQuestions, filterValue, qa, tagValue]);

  const myQuestions = useMemo(() => {
    if (Array.isArray(filteredEventQaQuestions) && user) {
      return filteredEventQaQuestions?.filter(
        (qa) => qa?.userId === String(user?.id)
      );
    } else {
      return [];
    }
  }, [filteredEventQaQuestions, user]);

  const awaitingReview = useMemo(() => {
    if (Array.isArray(eventQAQuestions)) {
      return eventQAQuestions?.filter((qa) => qa?.questionStatus === "pending");
    } else {
      return [];
    }
  }, [eventQAQuestions]);

  function initiateReply(question: TQAQuestion | null) {
    setReplyQuestion(question);
  }
  function replyToNull() {
    setReplyQuestion(null);
  }

  async function stopAskingQuestion() {
    setIsStopping(true);
    const payload: Partial<TQa> = {
      ...qa,
      accessibility: {
        ...qa?.accessibility,
        cannotAskQuestion: true,
      },
    };
    await postData({ payload });
    setIsStopping(false);
    getData();
  }

  if (!organization && isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <LoaderAlt size={30} className="animate-spin" />
      </div>
    );
  }
  return (
    <>
      <div className="w-full bg-[#F9FAFF] h-full">
        <div
          className={cn(
            "w-full rounded-lg h-[100vh] relative bg-white gap-6 grid grid-cols-8"
          )}
        >
          <QaAdvert
            eventName={qa?.coverTitle ?? ""}
            close={() => {
              setIsRightBox(!isRightBox);
              // setIsLeftBox(true)
            }}
            closeMobile={() => {
              setIsRightBox(true);
              setIsLeftBox(false);
            }}
            isLeftBox={isLeftBox}
            isRightBox={isRightBox}
            qa={qa}
          />
          <div
            className={cn(
              "w-full h-[100vh] col-span-full md:col-span-6 relative rounded-lg bg-[#F9FAFF]",
              !isLeftBox &&
                isRightBox &&
                "col-span-full md:col-span-full block",
              !isRightBox && "hidden"
            )}
          >
            <TopSection
              setActiveState={setActiveState}
              activeState={active}
              filterValue={filterValue}
              setFilterValue={setFilterValue}
              allQuestionsCount={filteredEventQaQuestions?.length || 0}
              myQuestionsCount={myQuestions?.length || 0}
              awaitingReviewCount={awaitingReview?.length || 0}
              qa={qa}
              workspaceAlias={workspaceAlias}
              tagValue={tagValue}
              setTagValue={setTagValue}
              refetch={getData}
            />
            <div className="w-full pt-6 h-[87vh] bg-[#F9FAFF] px-4">
              {active === 1 && (
                <AllQuestions
                  initiateReply={initiateReply}
                  replyQuestion={replyQuestion}
                  replyToNull={replyToNull}
                  refetch={
                    qa?.accessibility?.live ? async () => {} : getQAQUestions
                  }
                  qaQuestions={filteredEventQaQuestions || []}
                  userDetail={{
                    userId: String(user?.id),
                    userNickName: `${user?.firstName ?? ""} ${
                      user?.lastName ?? ""
                    }`,
                    userImage: `${user?.firstName ?? ""} ${
                      user?.lastName ?? ""
                    }`,
                  }}
                  qa={qa}
                />
              )}
              {active === 2 && (
                <MyQuestions
                  refetch={
                    qa?.accessibility?.live ? async () => {} : getQAQUestions
                  }
                  qa={qa}
                  myQuestions={myQuestions}
                  userDetail={{
                    userId: String(user?.id),
                    userNickName: `${user?.firstName ?? ""} ${
                      user?.lastName ?? ""
                    }`,
                    userImage: `${user?.firstName ?? ""} ${
                      user?.lastName ?? ""
                    }`,
                  }}
                />
              )}
              {active === 3 && (
                <AwaitingReview
                  refetch={
                    qa?.accessibility?.live ? async () => {} : getQAQUestions
                  }
                  awaitingReview={awaitingReview}
                  qa={qa}
                />
              )}
            </div>
            {/*** floating left button mobile*/}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftBox(true);
                setIsRightBox(false);
              }}
              className="px-0 block md:hidden bg-gray-300/40 rounded-full  fixed z-50 left-8  bottom-16 sm:left-10 sm:bottom-20 h-10 w-10"
            >
              <Minimize2 size={20} />
            </Button>
            {/*** floating left button desktop */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftBox(!isLeftBox);
              }}
              className="px-0 hidden  fixed md:block z-[9] right-8  bottom-[9rem] sm:right-10  sm:bottom-[9rem] h-14 w-14 bg-gray-200 rounded-full"
            >
              <Minimize2 size={30} />
            </Button>
            {active === 1 && (
              <Button
                onClick={onShowQuestionModal}
                className="h-14 w-14 fixed z-[9] right-8 px-0 bottom-16 sm:right-10 sm:bottom-20 rounded-full bg-basePrimary"
              >
                <Plus size={40} className="text-white" />
              </Button>
            )}
            <div className="w-full flex items-center fixed bottom-0 sm:sticky justify-center bg-white px-6 h-[8vh]">
              <div className="w-full h-full flex items-center justify-between">
                <Button
                onClick={() => router.push(`/e/${workspaceAlias}/qa/o/${qaId}/analytics`)}
                className="gap-x-2 bg-basePrimary-200  border-basePrimary border  rounded-xl h-9">
                  <AnalyticsIcon />
                  <p className="bg-basePrimary hidden sm:block  gradient-text">
                    Analytics
                  </p>
                </Button>

                <Button
                  onClick={() => setIsStopQuestion(true)}
                  className={cn(
                    "rounded-[3rem] h-fit bg-basePrimary-200 px-2 border border-basePrimary gap-x-2",
                    !qa?.accessibility?.cannotAskQuestion &&
                      "border-red-500 bg-red-100"
                  )}
                >
                  {!qa?.accessibility?.cannotAskQuestion ? (
                    <InlineIcon
                      fontSize={52}
                      color="#ef4444"
                      icon="solar:stop-circle-bold-duotone"
                    />
                  ) : (
                    <PlayQuizIcon />
                  )}
                  <p
                    className={cn(
                      "text-red-500 hidden sm:block text-sm sm:text-base ",
                      qa?.accessibility?.cannotAskQuestion &&
                        "gradient-text bg-basePrimary"
                    )}
                  >
                    {qa?.accessibility?.cannotAskQuestion
                      ? "Ask Question"
                      : "Stop Question"}
                  </p>
                </Button>
                <Button
                  onClick={() => setIsShare((prev) => prev)}
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
        </div>
      </div>
      {isOpen && organization && (
        <AskandReplyModal
          userDetail={{
            userId: String(user?.id),
            userNickName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
            userImage: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
          }}
          qa={qa}
          QandAAlias={qaId}
          refetch={qa?.accessibility?.live ? async () => {} : getQAQUestions}
          close={onShowQuestionModal}
        />
      )}
      {isStopQuestion && (
        <ActionModal
          loading={isStopping}
          modalText={
            qa?.accessibility?.cannotAskQuestion
              ? "Are you sure you want attendee to start asking question?"
              : "Are you sure you want to stop attendee from asking question?"
          }
          close={() => setIsStopQuestion(false)}
          asynAction={stopAskingQuestion}
          buttonText={qa?.accessibility?.cannotAskQuestion ? "Start" : "Stop"}
          title={
            qa?.accessibility?.cannotAskQuestion
              ? "Ask Question"
              : "Close Question"
          }
          buttonColor="bg-basePrimary text-white"
        />
      )}
      {isShare && (
        <ShareEngagement
          urlLink={`https://engagements.zikoro.com/e/${qa?.workspaceAlias}/a/${qa?.QandAAlias}`}
          title={qa?.coverTitle}
          close={() => setIsShare((prev) => prev)}
        />
      )}
    </>
  );
}
