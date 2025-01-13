import { cn } from "@/lib/utils";
import Link from "next/link";

export function LobbyHeader({
  isAttendee,
  isLive,
  noOfParticipants,
  coverTitle,
  isMaxReached
}: {
  isAttendee?: boolean;
  noOfParticipants: string;
  isLive?: boolean;
  coverTitle: string;
  isMaxReached:boolean;
}) {
  return (
    <div className="mt-6 mb-4 gap-3 flex flex-col items-center justify-center">
      {isAttendee && (
        <>
          {isLive && (
            <p className="px-2 py-1 rounded-3xl border border-basePrimary">
              <span className="gradient-text bg-basePrimary ">Live Quiz</span>
            </p>
          )}
          <h2 className="text-base sm:text-2xl font-semibold text-center">
            {coverTitle}
          </h2>

          <p className="text-xs sm:text-mobile">
            You are in the lobby with{" "}
            <span className="font-semibold">{noOfParticipants}</span> other
            participantd
          </p>
        </>
      )}

      <p className="text-center font-semibold text-desktop sm:text-lg">Particpants Joining</p>
      {isMaxReached && !isAttendee && (
              <p className="text-xs sm:text-mobile text-gray-600">
                Maximum Live Player has been reached.
                <Link
                  href="/pricing"
                  className={cn(
                    "text-basePrimary font-medium",
                    isAttendee && "hidden"
                  )}
                >
                  Upgrade
                </Link>
              </p>
            )}
    </div>
  );
}
