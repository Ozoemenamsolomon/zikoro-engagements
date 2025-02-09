"use client";

import { LoadingState } from "@/components/composables/LoadingState";
import { useGetData } from "@/hooks/services/requests";
import { TQa } from "@/types/qa";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/custom";
import { MetricCard } from "../_components";
import { useMemo } from "react";
import { useGetQAQuestions } from "@/hooks/services/qa";
import _ from "lodash";
import { EmptyQuizQuestionIcon } from "@/constants";

export default function QaAnalytics({ qaId }: { qaId: string }) {
  const router = useRouter();
  const { data: qa, isLoading: loadingEng } = useGetData<TQa>(
    `engagements/qa/${qaId}`
  );
  const { eventQAQuestions, setEventQAQuestions, isLoading, getQAQUestions } =
    useGetQAQuestions({ qaId });

  // total questions
  const totalQuestions = useMemo(() => {
    if (Array.isArray(eventQAQuestions) && qa) {
      return eventQAQuestions?.filter((v) => v?.userId !== qa?.workspaceAlias)
        ?.length;
    } else return 0;
  }, [eventQAQuestions, qa]);

  const totalParticipantsThatAskedQuestion = useMemo(() => {
    if (Array.isArray(eventQAQuestions) && qa) {
      const filtered = eventQAQuestions?.filter(
        (v) => v?.userId !== qa?.workspaceAlias
      );
      const uniqueParticipants = _.uniqBy(filtered, "userId");
      return uniqueParticipants?.length;
    } else return 0;
  }, [eventQAQuestions, qa]);

  const totalParticipantsThatEngagedTheQa = useMemo(() => {
    if (Array.isArray(eventQAQuestions) && qa) {
      const filtered = eventQAQuestions
        ?.filter((v) => v?.userId !== qa?.workspaceAlias)
        ?.map((u) => {
          return {
            userId: u?.userId,
          };
        });
      const filteredVoters = eventQAQuestions?.flatMap((v) => v?.voters);
      const uniqueParticipants = _.uniqBy(
        [...filtered, ...filteredVoters],
        "userId"
      );
      return uniqueParticipants?.length;
    } else return 0;
  }, [eventQAQuestions, qa]);

  const totalUpvotes = useMemo(() => {
    if (Array.isArray(eventQAQuestions)) {
      return eventQAQuestions?.reduce((acc, curr) => acc + curr?.vote, 0);
    } else return 0;
  }, [eventQAQuestions]);

  const avgUpVotes = useMemo(() => {
    if (Array.isArray(eventQAQuestions)) {
      return (
        eventQAQuestions?.reduce((acc, curr) => acc + curr?.vote, 0) /
        eventQAQuestions?.length
      );
    } else return 0;
  }, [eventQAQuestions]);

  //   const topUpvotedQuestions = useMemo(() => {
  //     if (Array.isArray(eventQAQuestions)) {
  //       const upvoteCounts: Record<string, number> = _.reduce(
  //         eventQAQuestions,
  //         (acc: Record<string, number>, question) => {
  //           const voters = question?.voters || ([] as { userId: string }[]);
  //           voters.forEach((voter) => {
  //             acc[voter.userId] = (acc[voter.userId] || 0) + 1;
  //           });
  //           return acc;
  //         },
  //         {}
  //       );

  //       return Object.entries(upvoteCounts)
  //         .map(([userId, count]) => ({ userId, count }))
  //         .sort((a, b) => b.count - a.count)
  //         .slice(0, 5);
  //     } else return [];
  //   }, [eventQAQuestions]);

  const topUpvotedQuestions = useMemo(() => {
    if (Array.isArray(eventQAQuestions)) {
      return eventQAQuestions
        ?.filter((v) => v?.vote > 0)
        ?.sort((a, b) => a.vote - b.vote)
        .slice(0, 5);
    } else return [];
  }, [eventQAQuestions]);

  if (isLoading || loadingEng) {
    return <LoadingState />;
  }

  return (
    <div className="w-full text-sm max-w-7xl mx-auto p-4 sm:p-6">
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          className="flex items-center gap-x-2"
          onClick={() => router.back()}
        >
          <InlineIcon
            icon="material-symbols:arrow-back-rounded"
            fontSize={22}
          />
          <p className="text-sm hidden sm:block">{qa?.coverTitle}</p>
        </button>
        <h2 className="font-semibold text-lg sm:text-base">Analytics</h2>
        <Button className="flex items-center bg-basePrimary h-10 text-white rounded-lg gap-x-2">
          <InlineIcon icon="carbon:export" fontSize={18} color="#ffffff" />
          <p>Export as CSV</p>
        </Button>
      </div>
      <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
        Overview
      </h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Question Submitted"
          subTitle="The total number of question participants submitted during the session"
          metric={`${totalQuestions}`}
        />
        <MetricCard
          title="Total Participants"
          subTitle="The total number of unique users who submitted or upvoted a question"
          metric={`${totalParticipantsThatEngagedTheQa}`}
        />{" "}
        <MetricCard
          title="Participants who asked a Question"
          subTitle="Number of people that participated"
          metric={`${totalParticipantsThatAskedQuestion}`}
        />
        <MetricCard
          title="Total Number of Upvotes"
          subTitle="Total of Upvotes of Q & A "
          metric={`${totalUpvotes}`}
        />
        <MetricCard
          title="Average Upvotes Per Question"
          subTitle="Average number of upvotes received by each question"
          metric={`${avgUpVotes}`}
        />
      </div>
      <div className="w-full mt-6 flex flex-col items-start justify-start gap-6">
        <h2 className="font-semibold text-base sm:text-lg mb-3 text-start">
          Top Upvoted Questions
        </h2>

        <div className="w-full border bg-white  rounded-lg">
          {Array.isArray(topUpvotedQuestions) &&
          topUpvotedQuestions?.length > 0 ? (
            <>
              <div className="w-full p-2 text-sm mb-2 border-b font-semibold grid grid-cols-4 gap-2">
                <p>S/N</p>

                <p className="col-span-2">Question</p>
                <p>Upvotes</p>
              </div>
              {topUpvotedQuestions?.map((question, index) => (
                <div
                  key={question.id}
                  className="w-full p-2 text-sm border-b grid grid-cols-4 gap-2"
                >
                  <p>{index + 1}</p>
                  <p className="w-full col-span-2 text-ellipsis whitespace-nowrap">
                    {question?.content}
                  </p>
                  <p>{question?.vote}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="w-full flex flex-col p-4 sm:p-6 items-center justify-center h-[500px] bg-white rounded-lg">
              <EmptyQuizQuestionIcon />
              <h2 className="font-semibold text-base sm:text-lg mt-5">
                No Question upvoted yet
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
