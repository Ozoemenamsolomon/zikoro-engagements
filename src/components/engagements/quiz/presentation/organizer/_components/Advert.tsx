import { Link45deg } from "styled-icons/bootstrap";
import { Minimize2 } from "styled-icons/feather";
import { Button } from "@/components/custom";
import { TQuiz, TQuestion } from "@/types/quiz";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";
import copy from "copy-to-clipboard";
export function Advert({
  quiz,
  isRightBox,
  close,
  isLeftBox,
  isFromPoll,
  isAdvert,
  className
}: {
  quiz: TQuiz<TQuestion[]>;
  isLeftBox: boolean;
  close: () => void;
  isRightBox: boolean;
  isFromPoll?: boolean;
  isAdvert?: boolean;
  className?:string;
}) {
  // console.log("ileft", isLeftBox, isRightBox);
  const quizLink =
    quiz?.interactionType === "poll"
      ? `https://engagements.zikoro.com/e/poll/${quiz?.workspaceAlias}/o/${quiz?.quizAlias}/presentation`
      : `https://engagements.zikoro.com/e/quiz/${quiz?.workspaceAlias}/o/${quiz?.quizAlias}/presentation`;
  return (
    <div
      className={cn(
        "w-full flex-col  h-full  items-start justify-between hidden col-span-3 md:hidden",
        isLeftBox && "flex md:flex ",
        !isRightBox && "col-span-3",
        isRightBox && isFromPoll && "col-span-full max-w-2xl ",
        isAdvert && "mx-auto justify-around",
        className
      )}
    >
      {quiz?.branding?.eventName ? (
        <h2 className="font-semibold line-clamp-1 w-full text-center p-4 text-base sm:text-xl">
          {quiz?.coverTitle}
        </h2>
      ) : (
        <div className="w-1 h-1"></div>
      )}
      <div className="w-full p-2 flex  flex-col gap-y-4 items-center justify-center ">
        <div className="w-fit h-fit  bg-white p-2">
          <QRCode size={200} value={quizLink} />
        </div>

        <div className="w-full flex items-center">
          <Button className="bg-white w-[10%] px-0 rounded-r-none rounded-l-lg border-y-0 border-l border-r-0 h-11">
            <Link45deg size={22} />
          </Button>
          <input
            value={quizLink}
            type="text"
            readOnly
            className="w-[70%] text-mobile h-11 border bg-white pl-4"
          />
          <Button
            onClick={() => {
              copy(quizLink);
            }}
            className="w-[20%] rounded-r-lg rounded-l-none bg-basePrimary text-white text-mobile"
          >
            <span className="text-white"> Copy</span>
          </Button>
        </div>

        <div className="w-full flex mt-8 flex-col items-center justify-center gap-y-3">
          <p>Or join at</p>
          <div className="gap-2 grid grid-cols-10">
            <p className="w-full col-span-9 text-ellipsis whitespace-nowrap overflow-hidden text-xl">
              www.zikoro.com/interaction
            </p>
          </div>
          <p className="font-semibold text-lg sm:text-3xl">{quiz?.quizAlias}</p>
        </div>
      </div>

      <div
        className={cn(
          "p-4 w-full flex items-end justify-end",
          isAdvert && "hidden"
        )}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="px-0 h-fit w-fit"
        >
          <Minimize2 size={20} />
        </Button>
      </div>
    </div>
  );
}
