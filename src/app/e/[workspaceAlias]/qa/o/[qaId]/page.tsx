
import QaOrganizerView from "@/components/engagements/qa/organizer/QaOrganizerView";
import { Metadata } from "next";

// export const generateMetadata = async ({
//   params,
// }: {
//   params: Promise<{ qaId: string }>;
// }): Promise<Metadata> => {
//   const qaId = (await params).qaId;

//   const response = fetch(`https://zikoro.com/api/engagements/qa/${qaId}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }).then((res) => res.json());

//   const qaDetail = await response;

//   return {
//     title: `${qaDetail?.data?.coverTitle || "Zikoro Q&A"} `,
//     description: `${qaDetail?.data?.description ?? ""}`,

//     openGraph: {
//       images: [
//      `${qaDetail?.data?.coverImage}` || ""
//       ],
//     },
//   };
// };

export default function Page({
  params: { workspaceAlias, qaId },
}: {
  params: { qaId: string; workspaceAlias:string; };
}) {
  return <QaOrganizerView qaId={qaId} workspaceAlias={workspaceAlias} />;
}
