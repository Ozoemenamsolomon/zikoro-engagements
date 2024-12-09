import {
  EngCloud,
  EngForms,
  EngPoll,
  EngQMark,
  EngQuiz,
} from "@/constants/icons";

export default function Section2() {
  return (
    <div>
      <div className="mt-[52px] lg:mt-[80px] max-w-full lg:max-w-[1128px] mx-auto">
        <p className="text-center text-2xl lg:text-[32px] font-bold">
          Empower Your Events and Meetings with <br /> Interactive Features
        </p>

        <div className="bg-white py-[32px] mt-8 lg:mt-[60px]">
          {/* 1st row */}
          <div className="grid grid-col-1 lg:grid-cols-2 gap-y-4">
            {/* 1st div */}
            <div className=" bg-[#f7f8ff] mx-4 lg:mx-[32px] py-[80px] rounded-[10px] col-span-1">
              <div className="flex justify-center">
                <EngQuiz />
              </div>

              <p className="text-center mt-3 text-2xl font-semibold">Quizzes</p>
              <p className="text-[#555555] text-center mt-3 font-medium">
                Test knowledge or entertain your <br /> audience with fun and
                informative <br /> quizzes.
              </p>
            </div>

            {/* 2nd div */}
            <div className=" bg-[#f7f8ff]  mx-4 lg:mx-[32px] py-[80px] rounded-[10px] col-span-1">
              <div className="flex justify-center">
                <EngQuiz />
              </div>

              <p className="text-center mt-3 text-2xl font-semibold">Polls</p>
              <p className="text-[#555555] text-center mt-3 font-medium">
                Gather instant opinions and make <br /> decisions on the spot.
              </p>
            </div>
          </div>

          {/* 2nd row */}

          <div className="grid grid-col-1 lg:grid-cols-3 ">
            {/* 1st div */}

            <div className=" bg-[#f7f8ff] mt-4 lg:mt-[32px] mx-4 lg:mx-[32px] py-[80px] rounded-[10px] col-span-1 ">
              <div className="flex justify-center">
                <EngQMark />
              </div>

              <p className="text-center mt-3 text-2xl font-semibold">Q&A</p>
              <p className="text-[#555555] text-center mt-3 font-medium">
                Allow your audience to ask questions
                <br />
                and spark meaningful discussions.
              </p>
            </div>

            {/* 2nd div */}
            <div className=" bg-[#f7f8ff] mt-4 lg:mt-[32px] mx-4 lg:mx-[32px] py-[80px] rounded-[10px] col-span-1">
              <div className="flex justify-center">
                <EngCloud />
              </div>

              <p className="text-center mt-3 text-2xl font-semibold">
                Word Clouds
              </p>
              <p className="text-[#555555] text-center mt-3 font-medium">
                Visualize audience input with <br /> engaging word clouds.
              </p>
            </div>

            {/* 3rd div */}
            <div className=" bg-[#f7f8ff] mt-4 lg:mt-[32px] mx-4 lg:mx-[32px] py-[80px] rounded-[10px]">
              <div className="flex justify-center">
                <EngForms />
              </div>

              <p className="text-center mt-3 text-2xl font-semibold">Forms</p>
              <p className="text-[#555555] text-center mt-3 font-medium">
                Collect data seamlessly with <br /> acustomizable forms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
