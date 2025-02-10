"use client";

import { useMemo, useState } from "react";
import { AskandReplyCard } from "./AskandReplyCard";
import { InlineIcon } from "@iconify/react";
import { Button } from "@/components/custom";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TQa, TQAQuestion } from "@/types/qa";
import { TUserAccess } from "@/types/user";

import toast from "react-hot-toast";
import { usePostRequest } from "@/hooks/services/requests";
import { HiDotsHorizontal } from "react-icons/hi";
import { generateAlias } from "@/utils";
import { EmptyQaState } from "./EmptyQaState";
import useAccessStore from "@/store/globalAccessStore";

export function AllQuestions({
  isAttendee,
  userDetail,
  qaQuestions,
  refetch,
  initiateReply,
  replyQuestion,
  replyToNull,
  qa,
}: {
  userDetail: TUserAccess | null;
  isAttendee?: boolean;
  qaQuestions: TQAQuestion[];
  refetch: () => Promise<any>;
  initiateReply: (t: TQAQuestion | null) => void;
  replyQuestion: TQAQuestion | null;
  replyToNull: () => void;
  qa: TQa;
}) {
  // const [replyQuestion, setReplyQuestion] = useState<TQAQuestion | null>(
  //   null
  // );

  const [reply, setReply] = useState("");
  const [name, setName] = useState(userDetail?.userNickName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { postData } = usePostRequest("/engagements/qa/qaQuestion");
  const { setUserAccess } = useAccessStore();

  const alias = useMemo(() => {
    return generateAlias();
  }, []);

  async function submitReply(e: any) {
    e.preventDefault();
    if (!reply) {
      return toast.error("Pls add your reply");
    }
    if (!replyQuestion) return;
    setIsSubmitting(true);

    const {
      moderationDetails,
      Responses,
      questionStatus,
      QandAAlias,
      id,
      ...restData
    } = replyQuestion;

    const user = isAttendee
      ? {
          userId: userDetail?.userId || alias,
          userNickName: userDetail?.userNickName || name || "",
          userImage: userDetail?.userImage || name || "",
        }
      : userDetail;
    const payload: Partial<TQAQuestion> = {
      ...replyQuestion,
      Responses: Array.isArray(replyQuestion?.Responses)
        ? [
            ...replyQuestion?.Responses,
            {
              ...restData,
              ...user,
              questionAlias: generateAlias(),
              content: reply,
              anonymous: isAnonymous,
              vote: 0,
              voters: [],
              created_at: new Date().toISOString(),
            },
          ]
        : [
            {
              ...restData,
              ...user,
              questionAlias: generateAlias(),
              content: reply,
              anonymous: isAnonymous,
              vote: 0,
              voters: [],
              created_at: new Date().toISOString(),
            },
          ],
    };

    await postData({ payload });
    setReply("");
    setName("");
    if (isAttendee && userDetail !== null) {
      setUserAccess({
        userId: userDetail?.userId || alias,
        userNickName: userDetail?.userNickName || name || "",
        userImage: userDetail?.userImage || name || "",
      });
    }
    if (!qa?.accessibility?.live) {
      initiateReply(null);
    }
    refetch();
    setIsSubmitting(false);
  }

  const useAcronym = useMemo(() => {
    if (qa?.accessibility?.allowAnonymous) {
      return "A";
    } else if (typeof userDetail?.userImage === "string") {
      const splittedName = userDetail?.userImage?.split(" ");
      if (splittedName?.length > 1) {
        return `${splittedName[0].charAt(0) ?? ""}${
          splittedName[1].charAt(0) ?? ""
        }`;
      } else
        return `${splittedName[0].charAt(0) ?? ""}${
          splittedName[0].charAt(1) ?? ""
        }`;
    } else return "A";
  }, [userDetail]);

  if (qaQuestions?.length === 0) {
    return (
      <EmptyQaState
        title="No Question Yet!"
        description="All Questions will appear here. You can ask your question"
      />
    );
  }
  return (
    <div
      className={cn(
        "w-full max-w-2xl overflow-y-auto pb-10   no-scrollbar h-full mx-auto",
        replyQuestion !== null && "bg-white p-4 h-fit"
      )}
    >
      {!replyQuestion ? (
        <div className="w-full flex flex-col items-start justify-start gap-3 sm:gap-4">
          {Array.isArray(qaQuestions) &&
            qaQuestions.map((quest, index) => {
             
              return (
                <AskandReplyCard
                  key={quest.questionAlias}
                  qaQuestion={quest}
                  className="bg-white border"
                  showReply={initiateReply}
                  isAttendee={isAttendee}
                  refetch={refetch}
                  userDetail={userDetail}
                  qa={qa}
                />
              );
            })}
        </div>
      ) : (
        <div className="w-full flex flex-col items-start justify-start gap-4 ">
          <button
            onClick={() => replyToNull()}
            className="flex items-center gap-x-1 text-mobile sm:text-sm"
          >
            <InlineIcon
              fontSize={20}
              icon="material-symbols-light:arrow-back"
            />
            <p>Replying</p>
          </button>
          <AskandReplyCard
            qaQuestion={replyQuestion}
            showReply={initiateReply}
            userDetail={userDetail}
            qa={qa}
            isReply
          />
          <form
            onSubmit={submitReply}
            className={cn(
              "w-full flex items-center border rounded-lg p-3 justify-center gap-3 flex-col",
              !qa?.accessibility?.canRespond && isAttendee && "hidden"
            )}
          >
            <div className="w-full flex items-end gap-x-2">
              {!qa?.accessibility?.allowAnonymous &&
              userDetail?.userImage?.startsWith("https://") ? (
                <Image
                  src={(userDetail?.userImage as string) || "/zikoro.png"}
                  alt=""
                  className="rounded-full h-12 object-contain border w-12"
                  width={100}
                  height={100}
                />
              ) : (
                <div className="w-[3rem]  border-basePrimary  border  bg-basePrimary-100 h-[3rem] rounded-full flex items-center justify-center">
                  <p className="gradient-text  bg-basePrimary text-lg uppercase">
                    {useAcronym}
                  </p>
                </div>
              )}

              <div className="w-[80%] flex flex-col gap-y-2 items-start">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className="border-0 border-b rounded-none w-full"
                  placeholder="Enter a name"
                  type="text"
                />
                <Input
                  value={reply}
                  onChange={(e) => {
                    setReply(e.target.value);
                  }}
                  className="border-0 border-b rounded-none w-full"
                  placeholder="Enter your reply"
                  type="text"
                />
              </div>
              <Button
                disabled={isSubmitting}
                type="submit"
                className="h-10 w-10 bg-basePrimary rounded-full px-0 "
              >
                {isSubmitting ? (
                  <HiDotsHorizontal
                    size={20}
                    className="animate-pulse text-white"
                  />
                ) : (
                  <InlineIcon icon="prime:send" color="#ffffff" fontSize={30} />
                )}
              </Button>
            </div>
            {qa?.accessibility?.allowAnonymous && (
              <label
                htmlFor="isAnonymous"
                className="flex items-center gap-x-2"
              >
                <input
                  id="anonymous"
                  name="anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(!isAnonymous)}
                  className="accent-basePrimary h-4 w-4 rounded-lg"
                />
                <p className="text-sm ">Reply as anyonymous</p>
              </label>
            )}
          </form>

          <div className="w-full flex flex-col items-start justify-start gap-3 sm:gap-4">
            {Array.isArray(replyQuestion?.Responses) &&
              replyQuestion?.Responses.map((quest, index) => (
                <AskandReplyCard
                  key={index}
                  className="border bg-[#F9FAFF]"
                  isReply
                  qaQuestion={quest}
                  refetch={refetch}
                  responseId={quest?.questionAlias}
                  originalQuestion={replyQuestion}
                  userDetail={userDetail}
                  showReply={initiateReply}
                  qa={qa}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
