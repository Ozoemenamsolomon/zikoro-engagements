import { PeopleIcon, TimerIcon } from "@/constants";

export function TopSection({changeDuration, noOfParticipants = 0, duration}: {changeDuration:() => void; duration: string; noOfParticipants: number}) {
  return (
   
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col items-center justify-start ">
          <div className="flex items-center gap-x-2">
            <div className="bg-basePrimary-100 h-12 justify-center px-3 rounded-3xl flex items-center gap-x-2">
              <TimerIcon />
              <p>{duration}</p>
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
          <div className="bg-basePrimary-100 h-12 justify-center px-3 rounded-3xl flex items-center gap-x-2">
            <PeopleIcon />
            <p>{noOfParticipants}</p>
          </div>
          <p>Participants</p>
        </div>
 
    </div>
  );
}
