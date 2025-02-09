import { TEngagementFormQuestion } from "@/types/form";
import Image from "next/image";
import { IoMdStar } from "react-icons/io";
export function FillFormQuestion({
  currentIndex,
  currentQuestion,
  description,
  questionImage,
  isRequired,
}: {
  currentIndex: number;
  currentQuestion: string;
  description?: string;
  questionImage?: string;
  isRequired: boolean;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex items-start">
        <p className="w-10 h-10 flex text-lg items-center bg-basePrimary-100 justify-center rounded-full border border-basePrimary">
          {currentIndex}
        </p>
        {isRequired && <IoMdStar size={12} className="text-red-700" />}
      </div>
      <div
        className="innerhtml items-center text-center w-full font-medium"
        dangerouslySetInnerHTML={{
          __html: currentQuestion ?? "",
        }}
      />
      {description && (
        <div
          className="innerhtml items-center text-center w-full text-sm"
          dangerouslySetInnerHTML={{
            __html: description ?? "",
          }}
        />
      )}
      {questionImage && (
        <Image
          className="w-52 sm:w-72 rounded-md h-48 sm:h-52 object-cover"
          alt="quiz"
          src={questionImage}
          width={400}
          height={400}
        />
      )}
    </div>
  );
}
