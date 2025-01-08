import { useState } from "react";
import { AskandReplyCard } from "./AskandReplyCard";
import { InlineIcon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { TQa, TQAQuestion } from "@/types/qa";
import { TUserAccess } from "@/types/user";
import { EmptyQaState } from "./EmptyQaState";

export function MyQuestions({
  isAttendee,
  myQuestions,
  refetch,
  qa,
  userDetail
}: {
  refetch: () => Promise<any>;
  isAttendee?: boolean;
  myQuestions: TQAQuestion[];
  qa: TQa;
  userDetail: TUserAccess | null
}) {
  const [replyQuestion, setReplyQuestion] = useState<TQAQuestion | null>(
    null
  );

  function initiateReply(question: any) {
    setReplyQuestion(question);
  }

  if (myQuestions?.length === 0) {
    return (
      <EmptyQaState
        title="It looks like you haven't asked a question yet"
        description="All your Questions will appear here."
      />
    );
  }
  return (
    <div
      className={cn(
        "w-full max-w-2xl overflow-y-auto pb-10  no-scrollbar h-full mx-auto",
        replyQuestion && "bg-white p-4 h-fit"
      )}
    >
      {!replyQuestion ? (
        <div className="w-full flex flex-col items-start justify-start gap-3 sm:gap-4">
          {Array.isArray(myQuestions) &&
            myQuestions.map((quest, index) => (
              <AskandReplyCard
                key={quest?.questionAlias}
                className="bg-white border"
                showReply={initiateReply}
                isAttendee={isAttendee}
                qaQuestion={quest}
                qa={qa}
                refetch={refetch}
                isMyQuestion
               userDetail={userDetail}
               
              />
            ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-start justify-start gap-4 ">
          <button
            onClick={() => setReplyQuestion(null)}
            className="flex items-center gap-x-1 text-mobile sm:text-sm"
          >
            <InlineIcon
              fontSize={20}
              icon="material-symbols-light:arrow-back"
            />
            <p>Back</p>
          </button>
          <AskandReplyCard qa={qa} isReply  userDetail={userDetail} qaQuestion={replyQuestion} />

          <h2 className="font-semibold text-desktop sm:text-lg">Replies</h2>

          <div className="w-full flex flex-col items-start justify-start gap-3 sm:gap-4">
            {Array.isArray(replyQuestion?.Responses) &&
              replyQuestion?.Responses.map((quest, index) => (
                <AskandReplyCard
                  key={index}
                  className="border bg-[#F9FAFF]"
                  isReply
                  qa={qa}
                  qaQuestion={quest}
                  refetch={refetch}
                  isMyQuestion
                  userDetail={userDetail}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
