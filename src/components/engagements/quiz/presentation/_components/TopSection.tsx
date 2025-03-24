import { PeopleIcon, SmallLeaderBoardIcon } from "@/constants";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import Avatar, { AvatarFullConfig } from "react-nice-avatar";

export function TopSection({
  isAttendee,
  noOfParticipants,
  toggleBoard,
  isQuestionView,
  timer,
  attemptingToJoinIndicator,
  isLive,
  toggleJoiningAttempt,
  isLeftBox,
  playerAvatar,
  isTimer,
  rgba,
  btnColor
}: {
  changeDuration?: () => void;
  noOfParticipants?: string;
  isAttendee?: boolean;
  toggleBoard: () => void;
  isQuestionView?: boolean;
  timer?: number;
  attemptingToJoinIndicator?: boolean;
  isLive?: boolean;
  toggleJoiningAttempt?: () => void;
  isLeftBox?:boolean;
  playerAvatar?: Required<AvatarFullConfig>;
  isTimer?:boolean;
  rgba:string;
  btnColor:string;
  
}) {
  return (
    <div
    style={{
      color: btnColor
    }}
    className="w-full flex items-start pt-6 text-sm justify-between">
      <div className="flex flex-col items-start justify-start ">
        <div
        style={{
          backgroundColor: rgba,
         
        }}
          onClick={toggleJoiningAttempt}
          className=" relative h-10 justify-center px-3 rounded-3xl flex items-center gap-x-2"
        >
          
       
          <InlineIcon icon="ic:twotone-people-alt" fontSize={24} color={btnColor} />
          <p>{noOfParticipants}</p>
          {isLive && attemptingToJoinIndicator && (
            <div className="absolute -right-1 -top-2">
              <InlineIcon icon="mdi:dot" fontSize={24} color={btnColor} />
            </div>
          )}
        </div>

        <p>Participants</p>
      </div>

      {isQuestionView && isTimer && (
        <div className="bg-red-100 h-9 justify-center px-3 rounded-3xl flex items-center gap-x-2">
          <InlineIcon
            icon="solar:alarm-bold-duotone"
            color="#ef4444"
            fontSize={20}
          />
          <p>{timer}</p>
        </div>
      )}

      {!isAttendee && (
        <button
          onClick={toggleBoard}
          className="bg-basePrimary-200 h-10 justify-center px-3 rounded-3xl flex items-center gap-x-2"
        >
          <SmallLeaderBoardIcon />
          <p>{isLeftBox ? "Hide Leaderboard" : "Show LeaderBoard"}</p>
        </button>
      )}
      {isAttendee && <div className="flex items-center gap-x-1">
        <div className="w-10 h-10 rounded-full relative">
          <Avatar className="w-10 h-10 rounded-full" {...playerAvatar}/>
        </div>
        </div>}
    </div>
  );
}
