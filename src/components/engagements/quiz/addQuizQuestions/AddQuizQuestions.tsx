import { EmptyQuizQuestionIcon } from "@/constants";
import { QuizLayout } from "../_components/QuizLayout";
import { Button } from "@/components/custom";
import { LeadingHeadRoute, TrailingHeadRoute } from "../_components";

export default function AddQuizQuestions() {
  return (
    <QuizLayout
    LeadingWidget={LeadingHeadRoute}
    TrailingWidget={TrailingHeadRoute}
    
    >
      <EmptyQuestion />
    </QuizLayout>
  );
}

function EmptyQuestion() {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-5">
      <EmptyQuizQuestionIcon />
      <h2 className="font-semibold text-base sm:text-lg mt-5">
        Your Quiz is Empty
      </h2>
      <Button className="bg-basePrimary h-11 text-white font-medium">
        Add Question
      </Button>
    </div>
  );
}
