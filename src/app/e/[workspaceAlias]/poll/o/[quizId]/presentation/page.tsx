

import QuizOrganizerView from "@/components/engagements/quiz/presentation/organizer/QuizOrganizerView";
import { Metadata } from "next";
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ quizId: string }>;
}): Promise<Metadata> => {
  const quizId = (await params).quizId;

  const response = fetch(`https://engagements.zikoro.com/api/engagements/quiz/${quizId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  const quizDetail = await response;

  return {
    title: `${quizDetail?.data?.coverTitle || "Zikoro Poll Presentation"} `,
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
  return <QuizOrganizerView quizId={quizId} workspaceAlias={workspaceAlias} />;
}
