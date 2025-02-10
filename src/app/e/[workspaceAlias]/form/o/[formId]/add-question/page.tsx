import AddFormQuestions from "@/components/engagements/form/addFormQuestions/addFormQuestion";


// export const generateMetadata = async ({
//   params,
// }: {
//   params: Promise<{ quizId: string }>;
// }): Promise<Metadata> => {
//   const quizId = (await params).quizId;

//   const response = fetch(`https://engagements.zikoro.com/api/engagements/quiz/${quizId}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }).then((res) => res.json());

//   const quizDetail = await response;

//   return {
//     title: `${quizDetail?.data?.coverTitle || "Zikoro Quiz"} `,
//     description: `${quizDetail?.data?.description ?? ""}`,

//     openGraph: {
//       images: [
//      `${quizDetail?.data?.coverImage}` || ""
//       ],
//     },
//   };
// };

export default function Page({
  params: { workspaceAlias, formId },
}: {
  params: { formId: string; workspaceAlias: string };
}) {
 
  return <AddFormQuestions formId={formId} workspaceAlias={workspaceAlias} />;
}
