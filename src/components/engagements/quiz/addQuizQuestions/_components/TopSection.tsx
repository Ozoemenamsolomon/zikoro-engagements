import { PeopleIcon, TimerIcon } from "@/constants";

export function TopSection({changeDuration, points , duration, changePoint}: {changeDuration:() => void; duration?: string; points?: string; changePoint: () => void}) {
  return (
   
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col items-center justify-start ">
          <div className="flex items-center gap-x-2">
            <div className="bg-basePrimary-200 h-12 justify-center px-3 rounded-3xl flex items-center gap-x-2">
              <TimerIcon />
              <p>{duration} Secs</p>
            </div>

            <button
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                changeDuration()
            }}
            className="text-basePrimary">Edit</button>
          </div>
          <p>Question Duration</p>
        </div>
        <div className="flex flex-col items-center justify-center ">
         <div className="flex items-center gap-x-2">
         <button
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                changePoint()
            }}
            className="text-basePrimary">Edit</button>
         <div className="bg-basePrimary-200 h-12 justify-center px-3 rounded-3xl flex items-center gap-x-2">
         <TimerIcon />
            <p>{points}</p>
          </div>
         </div>
          <p className="self-end">Points</p>
        </div>
 
    </div>
  );
}
