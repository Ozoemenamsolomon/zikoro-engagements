"use client"

import { useRouter } from "next/navigation";
export default function Section1() {
  const router = useRouter()
  return (
    <>
      {/* big screen */}
      <div
        className="bg-cover bg-no-repeat flex px-3 lg:px-0 justify-center h-[calc(100vh-30px)]  2xl:h-[40vh] [@media(min-width:3000px)]:h-[20vh] w-full max-w-full 2xl:max-w-[1128px] mx-auto "
        style={{
          backgroundImage: `url(/home1.png)`,
        }}
      >
        {/* header text */}
        <div className="pt-[37px] lg:pt-[80px]">
          <p className="text-center font-extrabold text-3xl lg:text-4xl gradient-text bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end ">
            Supercharge Interactions with Zikoro Engagements
          </p>
          <p className=" text-[#555555] text-center font-medium text-base lg:text-xl mt-4 ">
            Engage your audience like never before with interactive quizzes,
            polls, Q&A, <br /> word clouds, and customizable forms.
          </p>
          <div className="flex justify-center">
            <button className="mt-8 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end" onClick={() => router.push('/login')}>
              Get Started For Free
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
