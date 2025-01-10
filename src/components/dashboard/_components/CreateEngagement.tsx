import { Button } from "@/components/custom";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { CreateQa } from "./create/CreateQa";
import { CreateType } from "@/types/home";
import { CreateQuiz } from "./create/CreateQuiz";


export function CreateEngagement({
  close,
  type,
}: {
  close: () => void;
  type: number;
}) {
  return (
    <div className="right-0 min-h-screen inset-y-0 fixed z-[100] max-w-3xl w-full bg-white overflow-y-auto">
      <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
        <Button
          onClick={close}
          className="h-10 w-10 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
        >
          <InlineIcon
            icon={"mingcute:close-line"}
            fontSize={22}
            color="#ffffff"
          />
        </Button>

        <RenderCreateEngagement type={type} />
      </div>
    </div>
  );
}

function RenderCreateEngagement({ type }: { type: number }) {
  switch (type) {
    case CreateType.qa:
      return <CreateQa/>;
      case CreateType.quiz:
        return <CreateQuiz/>;  
    default:
      return <></>;
  }
}
