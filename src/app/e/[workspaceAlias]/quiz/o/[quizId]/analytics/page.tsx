import QuizAnalytics from "@/components/engagements/quiz/quizAnalytics";

export default function Page({
  params: { quizId },
}: {
  params: { quizId: string };
}) {
  return <QuizAnalytics quizId={quizId} />;
}
