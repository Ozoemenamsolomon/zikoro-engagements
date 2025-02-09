

import QuizAttendeeView from "@/components/engagements/quiz/presentation/attendee/QuizAttendeeView";
import { Metadata } from "next";
import { deploymentUrl } from "@/utils";
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ quizId: string }>;
}): Promise<Metadata> => {
  const quizId = (await params).quizId;

  const response = fetch(`${deploymentUrl}/api/engagements/quiz/${quizId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  const quizDetail = await response;

  return {
    title: `${quizDetail?.data?.coverTitle || "Zikoro Quiz Presentation"} `,
    description: `${quizDetail?.data?.description ?? ""}`,

    openGraph: {
      images: [
     `${quizDetail?.data?.coverImage}` || ""
      ],
    },
  };
};

export default function Page({
  params: { workspaceAlias, quizId },
}: {
  params: { quizId: string; workspaceAlias:string; };
}) {
  return <QuizAttendeeView quizId={quizId} workspaceAlias={workspaceAlias} />;
}
