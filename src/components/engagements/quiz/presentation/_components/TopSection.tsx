import { PeopleIcon, SmallLeaderBoardIcon } from "@/constants";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

export function TopSection({
  isAttendee,
  noOfParticipants,
  toggleBoard,
  isQuestionView,
  timer,
  attemptingToJoinIndicator,
  isLive,
  toggleJoiningAttempt,
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
  
}) {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex flex-col items-start justify-start ">
        <div
          onClick={toggleJoiningAttempt}
          className="bg-basePrimary-200 relative h-12 justify-center px-3 rounded-3xl flex items-center gap-x-2"
        >
          <PeopleIcon />
          <p>{noOfParticipants}</p>
          {isLive && attemptingToJoinIndicator && (
            <div className="absolute -right-1 -top-2">
              <InlineIcon icon="mdi:dot" fontSize={24} color="#001fcc" />
            </div>
          )}
        </div>

        <p>Participants</p>
      </div>

      {isQuestionView && (
        <div className="bg-red-300 h-10 justify-center px-3 rounded-3xl flex items-center gap-x-2">
          <InlineIcon
            icon="solar:alarm-bold-duotone"
            color="#ef4444"
            fontSize={18}
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
          <p>Show LeaderBoard</p>
        </button>
      )}
    </div>
  );
}
