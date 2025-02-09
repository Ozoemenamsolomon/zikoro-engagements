import ScoreBoardPage from "@/components/engagements/quiz/presentation/attendee/ScoreBoardPage";
// export const generateMetadata = async ({
//   params,
// }: {
//   params: Promise<{ quizId: string }>;
// }): Promise<Metadata> => {
//   const quizId = (await params).quizId;

//   const response = fetch(
//     `https://engagements.zikoro.com/api/engagements/quiz/${quizId}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   ).then((res) => res.json());

//   const quizDetail = await response;

//   return {
//     title: `${quizDetail?.data?.coverTitle || "Zikoro Quiz Presentation"} `,
//     description: `${quizDetail?.data?.description ?? ""}`,

//     openGraph: {
//       images: [`${quizDetail?.data?.coverImage}` || ""],
//     },
//   };
// };

export default function Page({
  params: { quizId },
}: {
  params: { quizId: string };
}) {
  return <ScoreBoardPage quizId={quizId} />;
}
