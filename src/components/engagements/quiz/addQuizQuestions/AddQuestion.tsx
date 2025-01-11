import { TopSection } from "./_components";
import { QuestionField } from "./_components/QuestionField";

export function AddQuestion() {
  function changeDuration() {}
  return (
    <div className="w-full h-full">
      <TopSection
        noOfParticipants={0}
        duration="20 Sec"
        changeDuration={changeDuration}
      />

      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="w-full flex flex-col  gap-1 items-center">
          <p className="font-medium">Questions:</p>
          <p className="w-14 h-14 flex items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
            1
          </p>
        </div>
        <QuestionField/>
      </div>
    </div>
  );
}
