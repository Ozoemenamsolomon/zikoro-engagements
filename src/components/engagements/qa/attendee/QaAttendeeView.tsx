"use client";

import { useEffect, useState } from "react";
import {
  AllQuestions,
  AskandReplyModal,
  MyQuestions,
  TopSection,
} from "../_components";
import { Plus } from "styled-icons/bootstrap";
import { Button } from "@/components/custom/Button";
import { useGetQAQuestions, useQARealtimePresence } from "@/hooks/services/qa";
import { createClient } from "@/utils/supabase/client";
import { TQa, TQAQuestion } from "@/types/qa";
import { useMemo } from "react";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { useGetData } from "@/hooks/services/requests";
import {
  useVerifyAttendee,
} from "@/hooks/services/engagement";
import useAccessStore from "@/store/globalAccessStore";
import { InlineIcon } from "@iconify/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const supabase = createClient();
export default function QaAttendeeView({
  qaId,
  workspaceAlias,
}: {
  qaId: string;
  workspaceAlias: string;
}) {
  const [active, setActive] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("Recent");
  const [tagValue, setTagValue] = useState("");
  const { data: qa, isLoading: qaLoading } = useGetData<TQa>(
    `/engagements/qa/${qaId}`
  );
  const { userAccess, setUserAccess } = useAccessStore();
  const params = useSearchParams();

  // const { isHaveAccess, isLoading: loading } =
  //   useVerifyUserAccess(workspaceAlias);
  const [replyQuestion, setReplyQuestion] = useState<TQAQuestion | null>(null);
  const { eventQAQuestions, setEventQAQuestions, isLoading, getQAQUestions } =
    useGetQAQuestions({ qaId });
  const attendeeEmail = params.get("attendeeEmail");
  const { attendee, getAttendee, loading } = useVerifyAttendee();
  useQARealtimePresence(qa?.accessibility?.live);

  function setActiveState(n: number) {
    setActive(n);
  }

  function onShowQuestionModal() {
    setIsOpen((p) => !p);
  }

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
            if (item.questionAlias === updated.questionAlias) {
              return { ...updated };
            }
            return item;
          });
          // console.log("over  here at quest");
          setEventQAQuestions(updatedQuestions);

          if (
            replyQuestion !== null &&
            replyQuestion?.questionAlias === updated.questionAlias
          ) {
          //  console.log("over  here at reply");
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
  }, [supabase, qa, replyQuestion, eventQAQuestions]);

  ///console.log("qas ", eventQAQuestions);

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
    if (Array.isArray(eventQAQuestions)) {
      if (filterValue === "Recent") {
        return eventQAQuestions
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .filter((qa) => {
            return qa?.userId === userAccess?.userId;
          });
      } else if (filterValue === "Top Liked") {
        return eventQAQuestions
          .sort((a, b) => b.vote - a.vote)
          .filter((qa) => {
            return qa?.userId === userAccess?.userId;
          });
      } else return [];
    } else return [];
  }, [eventQAQuestions, userAccess, filterValue, qa, tagValue]);

  function initiateReply(question: TQAQuestion | null) {
    setReplyQuestion(question);
  }

  function replyToNull() {
    setReplyQuestion(null);
  }

  useEffect(() => {
    (async () => {
      if (attendeeEmail) {
        await getAttendee(workspaceAlias, attendeeEmail);
      }
    })();
  }, [attendeeEmail]);

  const isHaveAccess = useMemo(() => {
    if (!loading && attendeeEmail) {
      return attendee !== null;
    } else return true;
  }, [attendeeEmail, attendee]);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <LoaderAlt size={30} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* {!isSignedIn && <JoinQA joined={toggleJoin} addUser={addUser} />} */}
      {!loading && !isHaveAccess && !qa?.accessibility?.connectEvent && (
        <div className="w-full h-full inset-0 fixed z-[100] bg-white">
          <div className="w-[95%] max-w-xl border rounded-lg bg-gradient-to-b gap-y-6 from-white  to-basePrimary/20  h-[400px] flex flex-col items-center justify-center shadow absolute inset-0 m-auto">
            <InlineIcon
              icon="fluent:emoji-sad-20-regular"
              fontSize={60}
              color="#001fcc"
            />
            <div className="w-fit flex flex-col items-center justify-center gap-y-3">
              <p>You are not a registered attendee for this event</p>

              <Button
                onClick={() => {
                  window.open(
                    `https://zikoro.com/live-events/${attendee?.eventAlias}`
                  );
                }}
                className="bg-basePrimary h-12 text-white font-medium"
              >
                Register for the event
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full  bg-[#F9FAFF] h-full">
        <TopSection
          isAttendee={true}
          allQuestionsCount={filteredEventQaQuestions?.length || 0}
          myQuestionsCount={myQuestions?.length || 0}
          setActiveState={setActiveState}
          activeState={active}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          workspaceAlias={workspaceAlias}
          tagValue={tagValue}
          setTagValue={setTagValue}
          qa={qa}
        />

        <div className="w-full  h-full rounded-lg pt-5 sm:pt-6 bg-[#F9FAFF]">
          {active === 1 && (
            <AllQuestions
              refetch={
                qa?.accessibility?.live ? async () => {} : getQAQUestions
              }
              isAttendee
              qaQuestions={filteredEventQaQuestions || []}
              userDetail={userAccess}
              initiateReply={initiateReply}
              replyQuestion={replyQuestion}
              replyToNull={replyToNull}
              qa={qa}
            />
          )}
          {active === 2 && (
            <MyQuestions
              refetch={
                qa?.accessibility?.live ? async () => {} : getQAQUestions
              }
              isAttendee
              myQuestions={myQuestions}
              qa={qa}
              userDetail={userAccess}
            />
          )}
          {/*** floating button */}
          {active === 1 && (
            <Button
              onClick={onShowQuestionModal}
              className={cn(
                "h-14 w-14 fixed z-50 right-8 px-0 bottom-16 sm:right-10 sm:bottom-20 rounded-full bg-basePrimary",
                qa?.accessibility?.cannotAskQuestion && "hidden"
              )}
            >
              <Plus size={40} className="text-white" />
            </Button>
          )}
          {qa?.branding?.poweredBy && (
            <div className="w-full fixed bottom-0 inset-x-0 bg-white p-3 flex items-center justify-center">
              <Link
                target="_blank"
                className="text-mobile gap-x-1 flex items-center sm:text-sm"
                href={`${window.location.origin}/home`}
              >
                <p className="block">Create your own Q&A</p>
                <InlineIcon
                  icon="material-symbols-light:arrow-insert"
                  fontSize={18}
                  className="rotate-90"
                />
              </Link>
            </div>
          )}
        </div>
      </div>

      {isOpen && !qa?.accessibility?.cannotAskQuestion && (
        <AskandReplyModal
          userDetail={{
            userId: userAccess?.userId || "",
            userImage: userAccess?.userImage || "",
            userNickName: userAccess?.userNickName || "",
          }}
          QandAAlias={qaId}
          isAttendee
          close={onShowQuestionModal}
          qa={qa}
          setUserAccess={setUserAccess}
          refetch={qa?.accessibility?.live ? async () => {} : getQAQUestions}
        />
      )}
    </>
  );
}
