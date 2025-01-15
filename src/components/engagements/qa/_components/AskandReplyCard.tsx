import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import { TQa, TQAQuestion, TQaTag } from "@/types/qa";
import { TUserAccess } from "@/types/user";
import { InlineIcon } from "@iconify/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toZonedTime } from "date-fns-tz";
import { format, isToday, isYesterday } from "date-fns";
import { formatReviewNumber, generateAlias } from "@/utils";
import { usePostRequest } from "@/hooks/services/requests";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import useAccessStore from "@/store/globalAccessStore";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { AskandReplyModal } from "./AskandReplyModal";
import { ViewTag } from "@/components/composables/ViewTag";
export function AskandReplyCard({
  className,
  showReply,
  isReply,
  qaQuestion,
  isAttendee,
  refetch,
  userDetail,
  originalQuestion,
  responseId,
  qa,
  isMyQuestion,
}: {
  className?: string;
  showReply?: (q: TQAQuestion | null) => void;
  isReply?: boolean;
  qaQuestion?: Partial<TQAQuestion>;
  isAttendee?: boolean;
  refetch?: () => Promise<any>;
  userDetail?: TUserAccess | null;
  originalQuestion?: TQAQuestion;
  responseId?: string;
  qa: TQa;
  isMyQuestion?: boolean;
}) {
  const { postData, isLoading } = usePostRequest("/engagements/qa/qaQuestion");
  const { setUserAccess } = useAccessStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddTag, showAddTag] = useState(false);
  const [tag, setTag] = useState<TQaTag | null | undefined>(qaQuestion?.tags);

  const formattedTime = useMemo(() => {
    const utcDate = new Date(qaQuestion?.created_at as string);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = toZonedTime(utcDate, timeZone);

    if (isToday(localDate)) {
      return `Today ${format(localDate, "hh:mm a")}`;
    }

    if (isYesterday(localDate)) {
      return `Yesterday ${format(localDate, "hh:mm a")}`;
    }

    return format(localDate, "MM dd yyyy hh:mm a");
  }, [qaQuestion?.created_at]);

  const formatResponsesCount = useMemo(() => {
    if (qaQuestion && Array.isArray(qaQuestion?.Responses)) {
      return formatReviewNumber(qaQuestion?.Responses?.length);
    } else {
      return "0";
    }
  }, [qaQuestion]);

  const formatVotesCount = useMemo(() => {
    if (qaQuestion) {
      return formatReviewNumber(qaQuestion?.vote || 0);
    } else {
      return "0";
    }
  }, [qaQuestion, responseId]);

  async function selectTag(data: TQaTag) {
    setTag(data);
    const payload = {
      ...qaQuestion,
      tags: data,
    };
    await postData({ payload });
    refetch?.();
  }

  /**
    if (responseId && originalQuestion) {
      return formatReviewNumber(originalQuestion?.vote);
    }
    else
   */

  const id = useMemo(() => {
    return generateAlias();
  }, []);

  const isVoted = useMemo(() => {
    if (responseId && Array.isArray(originalQuestion?.Responses)) {
      const responseVoters = originalQuestion?.Responses?.flatMap(
        (v) => v?.voters
      );
      return (
        Array.isArray(originalQuestion?.Responses) &&
        responseVoters?.some((c) => c?.userId === userDetail?.userId)
      );
    } else {
      return (
        Array.isArray(qaQuestion?.voters) &&
        qaQuestion?.voters?.some((c) => c?.userId === userDetail?.userId)
      );
    }
  }, [responseId, qaQuestion, originalQuestion]);

  async function voteFn() {
    setLiked(true);

    const payload: Partial<TQAQuestion> = responseId
      ? {
          ...originalQuestion,
          Responses: originalQuestion?.Responses?.map((resp) => {
            if (resp?.questionAlias === responseId) {
              return {
                ...resp,
                vote: (resp?.vote || 0) + 1,
                voters: Array.isArray(resp?.voters)
                  ? [
                      ...resp?.voters,
                      {
                        userId: userDetail?.userId || id,
                      },
                    ]
                  : [
                      {
                        userId: userDetail?.userId || id,
                      },
                    ],
              };
            }
            return resp;
          }),
        }
      : {
          ...qaQuestion,
          vote: (qaQuestion?.vote || 0) + 1,
          voters: Array.isArray(qaQuestion?.voters)
            ? [
                ...qaQuestion?.voters,
                {
                  userId: userDetail?.userId || id,
                },
              ]
            : [
                {
                  userId: userDetail?.userId || id,
                },
              ],
        };

    await postData({ payload });
    setUserAccess({ userId: id });
    if (!qa?.accessibility?.live) {
      showReply?.(null);
    }
    refetch?.();
  }

  async function downVote() {
    setLiked(false);
    const payload: Partial<TQAQuestion> = responseId
      ? {
          ...originalQuestion,
          Responses: originalQuestion?.Responses?.map((resp) => {
            if (resp?.questionAlias === responseId) {
              return {
                ...resp,
                vote: (resp?.vote || 0) - 1,
                voters: resp?.voters?.filter(
                  (v) => v?.userId !== userDetail?.userId
                ),
              };
            }
            return resp;
          }),
        }
      : {
          ...qaQuestion,
          vote: (qaQuestion?.vote || 0) - 1,
          voters: qaQuestion?.voters?.filter(
            (v) => v?.userId !== userDetail?.userId
          ),
        };

    await postData({ payload });
    if (!qa?.accessibility?.live) {
      showReply?.(null);
    }
    refetch?.();
  }

  const useAcronym = useMemo(() => {
    if (qaQuestion?.anonymous && qa?.accessibility?.allowAnonymous) {
      return "A";
    } else if (typeof qaQuestion?.userImage === "string") {
      const splittedName = qaQuestion?.userImage?.split(" ");
      if (splittedName?.length > 1) {
        return `${splittedName[0].charAt(0) ?? ""}${
          splittedName[1].charAt(0) ?? ""
        }`;
      } else
        return `${splittedName[0].charAt(0) ?? ""}${
          splittedName[0].charAt(1) ?? ""
        }`;
    } else return "A";
  }, [qaQuestion]);

  useMemo(() => {
    if (
      userDetail &&
      qaQuestion?.voters?.some((qa) => qa?.userId === userDetail?.userId)
    ) {
      setLiked(true);
    }
  }, [userDetail, qaQuestion]);

  async function toggleIsAnswered() {
    const payload: Partial<TQAQuestion> = qaQuestion?.isAnswered
      ? {
          ...qaQuestion,
          isAnswered: false,
        }
      : {
          ...qaQuestion,
          isAnswered: true,
        };
    await postData({ payload });
    refetch?.();
  }

  async function togglePinned() {
    const payload: Partial<TQAQuestion> = qaQuestion?.isPinned
      ? {
          ...qaQuestion,
          isPinned: false,
        }
      : {
          ...qaQuestion,
          isPinned: true,
        };
    await postData({ payload });
    refetch?.();
  }

  // console.log("user", userDetail);
  function onShowQuestionModal() {
    setIsOpen((p) => !p);
  }

  const isEditable = useMemo(() => {
    if (isAttendee) {
      return (
        !isReply &&
        userDetail?.userId === qaQuestion?.userId &&
        !qaQuestion?.isAnswered &&
        qaQuestion?.questionStatus !== "verified" &&
        (qaQuestion?.Responses === null ||
          (Array.isArray(qaQuestion?.Responses) &&
            qaQuestion?.Responses?.length === 0))
      );
    } else {
      return !isReply && userDetail?.userId === qaQuestion?.userId;
    }
  }, [isReply, isAttendee, userDetail, qaQuestion]);

  return (
    <>
      <div
        className={cn(
          "w-full flex h-fit flex-col items-start p-3 relative rounded-lg justify-start gap-y-3 sm:gap-y-4",
          className,
          qaQuestion?.isAnswered &&
            " bg-basePrimary-100"
        )}
      >
        <div className={cn("flex w-full items-center justify-between")}>
          <div className="flex items-center gap-x-2">
            {!qaQuestion?.anonymous &&
            !qa?.accessibility?.allowAnonymous &&
            qaQuestion?.userImage?.startsWith("https://") ? (
              <Image
                src={(qaQuestion?.userImage as string) || "/zikoro.png"}
                alt=""
                className="rounded-full h-12 object-contain border w-12"
                width={100}
                height={100}
              />
            ) : (
              <div className="w-[3rem] bg-gradient-to-tr border-basePrimary from-custom-bg-gradient-start border to-custom-bg-gradient-end h-[3rem] rounded-full flex items-center justify-center">
                <p className="gradient-text  bg-basePrimary text-lg uppercase">
                  {useAcronym}
                </p>
              </div>
            )}

            <div className="flex items-start flex-col justify-start gap-1">
              <p className="font-semibold capitalize text-sm sm:text-desktop">
                {qaQuestion?.anonymous && qa?.accessibility?.allowAnonymous
                  ? "Anonymous"
                  : qaQuestion?.userNickName ?? "Anonymous"}
              </p>
              <p className="text-tiny sm:text-mobile text-gray-500">
                {formattedTime}
              </p>
            </div>
          </div>

          {isAttendee && (
            <p>{qaQuestion?.questionStatus === "pending" ? "In Review" : ""}</p>
          )}
          {!isAttendee && (
            <div className="absolute flex items-center gap-x-2 top-2 right-3">
              {tag && (
                <ViewTag
                  name={tag?.name}
                  className="rounded-lg text-sm h-9"
                  color={tag?.color}
                />
              )}
              {!isMyQuestion && qa?.accessibility?.canTag && (
                <button onClick={() => showAddTag(true)} className="relative">
                  <InlineIcon icon="mynaui:dots-vertical" fontSize={24} />

                  {isAddTag && (
                    <AddTag
                      close={() => showAddTag(false)}
                      tags={qa?.tags}
                      selectTag={selectTag}
                    />
                  )}
                </button>
              )}
              {!isMyQuestion && !isReply && qa?.accessibility?.canPin && (
                <button onClick={togglePinned} className="">
                  {qaQuestion?.isPinned ? (
                    <InlineIcon
                      fontSize={22}
                      color="#001fcc"
                      icon="pepicons-pencil:pin-circle-filled"
                    />
                  ) : (
                    <InlineIcon
                      fontSize={22}
                      icon="pepicons-pencil:pin-circle"
                    />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <p
          className={cn("text-justify  w-full", !isExpanded && "line-clamp-4")}
        >
          {qaQuestion?.content ?? ""}
        </p>
        <div className="w-full flex items-end justify-end">
          {qaQuestion?.content && qaQuestion.content.length > 100 && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "px-0 w-fit text-mobile sm:text-sm h-fit font-medium text-zikoroBlue",
                isExpanded && "text-gray-500"
              )}
            >
              {isExpanded ? "See Less" : "See More"}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center w-full gap-x-3">
          <Button
            onClick={() => {
              if (isVoted) {
                downVote();
              } else {
                voteFn();
              }
            }}
            disabled={isLoading}
            className="rounded-3xl  bg-basePrimary-100 gap-x-2 px-2 py-1 h-fit"
          >
            <span className="text-mobile">{formatVotesCount}</span>
            {isLiked ? (
              <AiFillLike color="#001fcc" size={20} />
            ) : (
              <AiOutlineLike size={20} />
            )}
          </Button>

          {!isReply && qaQuestion && (
            <Button
              onClick={() => showReply?.(qaQuestion as TQAQuestion)}
              className="rounded-3xl  bg-basePrimary-100 gap-x-2 px-2 py-1 h-fit"
            >
              <span className="text-mobile">{formatResponsesCount}</span>
              <InlineIcon fontSize={20} icon="mdi-light:message" />
            </Button>
          )}
          {!isReply && qa?.accessibility?.indicateAnsweredQuestions && (
            <Button
              disabled={isAttendee}
              onClick={toggleIsAnswered}
              className={cn(
                "rounded-3xl gap-x-1 px-2  bg-basePrimary-100 py-1 h-fit",
                isAttendee && !qaQuestion?.isAnswered && "hidden"
              )}
            >
              {qaQuestion?.isAnswered ? (
                <>
                  <p className="text-mobile sm:text-sm"> Answered</p>
                  <IoCheckmarkCircleOutline size={20} />
                </>
              ) : isAttendee ? (
                <></>
              ) : (
                <IoCheckmarkCircleOutline size={20} />
              )}
            </Button>
          )}
        </div>

        {isEditable && qa?.accessibility?.mustReviewQuestion && (
          <div className="w-full flex items-end justify-end">
            <Button
              onClick={onShowQuestionModal}
              className="w-fit h-fit px-0 text-mobile sm:text-sm gap-x-2"
            >
              <p>Edit</p>
              <InlineIcon icon="basil:edit-outline" fontSize={20} />
            </Button>
          </div>
        )}
      </div>
      {isOpen && (
        <AskandReplyModal
          userDetail={userDetail!}
          qa={qa}
          QandAAlias={qaQuestion?.QandAAlias!}
          refetch={qa?.accessibility?.live ? async () => {} : refetch}
          close={onShowQuestionModal}
          qaQuestion={qaQuestion}
        />
      )}
    </>
  );
}

function AddTag({
  close,
  tags,
  selectTag,
}: {
  tags: TQaTag[] | null;
  selectTag: (t: TQaTag) => void;
  close: () => void;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-1 top-6"
    >
      <div
        onClick={close}
        className="fixed inset-0 bg-none z-[400] w-full h-full"
      ></div>
      <div className="relative w-[120px] z-[450] shadow bg-white py-3">
        <div className="w-full flex flex-col items-start justify-start">
          {tags?.map((item, index) => (
            <button
              onClick={() => {
                selectTag(item);
                close();
              }}
              className="w-full hover:bg-gray-50 px-2 py-1 text-start"
              key={index}
            >
              {item?.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
