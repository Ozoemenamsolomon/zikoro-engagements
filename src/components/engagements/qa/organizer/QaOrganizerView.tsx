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
import {
  useGetQAQuestions,
  useQARealtimePresence,
} from "@/hooks/services/qa";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { createClient } from "@/utils/supabase/client";
import { TQa, TQAQuestion } from "@/types/qa";
import { useGetData } from "@/hooks/services/requests";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";

const supabase = createClient();
export default function QaOrganizerView({
    workspaceAlias,
  qaId,
}: {
    workspaceAlias: string;
  qaId: string;
}) {
  const [active, setActive] = useState(1);
  const {data: organization} =  useGetData<TOrganization>(`organization/${workspaceAlias}`)
  const [isOpen, setIsOpen] = useState(false);
  const [isRightBox, setIsRightBox] = useState(true);
  const [isLeftBox, setIsLeftBox] = useState(true);
  const { user } = useUserStore();
  const [filterValue, setFilterValue] = useState("Recent");
  const { data: qa, getData } = useGetData<TQa>(
    `/engagements/qa/${qaId}`,
    true,
    null,
    true
  );
  const [replyQuestion, setReplyQuestion] = useState<TQAQuestion | null>(
    null
  );
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
            console.log("rre", item.questionAlias === updated.questionAlias)
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
          .filter((v) => v?.questionStatus !== "pending");

        const pinnedQuestion = filtered.filter((q) => q?.isPinned);
        const unpinnedQuestion = filtered?.filter((q) => !q?.isPinned);

        return [...pinnedQuestion, ...unpinnedQuestion];
      } else if (filterValue === "Top Liked") {
        const filtered = eventQAQuestions
          .sort((a, b) => b.vote - a.vote)
          .filter((v) => v?.questionStatus !== "pending");

        const pinnedQuestion = filtered.filter((q) => q?.isPinned);
        const unpinnedQuestion = filtered?.filter((q) => !q?.isPinned);

        return [...pinnedQuestion, ...unpinnedQuestion];
      }
    } else return [];
  }, [eventQAQuestions, filterValue, qa]);

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

//   console.log("evv", eventQAQuestions);

//   console.log("reply", replyQuestion)

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
              !isLeftBox && isRightBox && "col-span-full md:col-span-full block",
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
              refetch={getData}
            />
            <div className="w-full pt-6 bg-[#F9FAFF] px-4">
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
    </>
  );
}
