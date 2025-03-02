
import PollAnalytics from "@/components/engagements/poll/_components/PollAnalytics";
export default function Page({
  params: { quizId },
}: {
  params: { quizId: string };
}) {
  return <PollAnalytics pollId={quizId} />;
}
