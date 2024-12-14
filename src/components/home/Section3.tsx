"use client";
import Image from "next/image";
import section1 from "@/public/section1.png";
import section2 from "@/public/section2.png";
import section3 from "@/public/section3.png";
import { useRouter } from "next/navigation";

export default function Section2() {
  const router = useRouter();
  return (
    <div className="mt-[80px] max-w-full lg:max-w-[1128px] mx-auto">
      <p className="text-center text-2xl lg:text-[32px] font-bold mt-[52px] lg:mt-[80px]">
        Why Zikoro Engagement Stands Out
      </p>

      {/* section 2 */}
      <div className=" mt-[32px] lg:mt-[60px]">
        {/* 1st row */}
        <div className="flex flex-col-reverse lg:flex-row gap-y-[35px] bg-white p-3 mt-4 lg:mt-8">
          <div className="flex justify-center items-center w-full lg:w-[50%]">
            <p className="text-base lg:text-2xl font-semibold ">
              Capture immediate{" "}
              <span className="inline lg:block"> feedback and generate </span>{" "}
              actionable insights.
            </p>
          </div>
          <div className="w-full lg:w-[50%]">
            <Image
              alt=""
              src={section1}
              width={309}
              height={87}
              className="w-full"
            />
          </div>
        </div>

        {/* 2nd row */}
        <div className="flex flex-col-reverse lg:flex-row-reverse gap-y-[35px] bg-white p-3 mt-4 lg:mt-8">
          <div className="flex justify-center items-center w-full lg:w-[50%]">
            <p className="text-base lg:text-2xl font-semibold ">
              User-friendly interface{" "}
              <span className="inline lg:block"> for seamless setup </span>{" "}
              <span className="inline lg:block"> and usage </span>
            </p>
          </div>
          <div className="w-full lg:w-[50%]">
            <Image
              alt=""
              src={section2}
              width={309}
              height={87}
              className="w-full"
            />
          </div>
        </div>

        {/* 3rd row */}
        <div className="flex flex-col-reverse lg:flex-row gap-y-[35px] bg-white p-3 mt-4 lg:mt-8">
          <div className="flex justify-center items-center w-full lg:w-[50%]">
            <p className="text-base lg:text-2xl font-semibold ">
              Works perfectly for events,
              <span className="inline lg:block">
                {" "}
                meetings, classrooms, and{" "}
              </span>{" "}
              <span className="inline lg:block"> more. </span>
            </p>
          </div>
          <div className="w-full lg:w-[50%]">
            <Image
              alt=""
              src={section3}
              width={309}
              height={87}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4 lg:mt-8">
          <button className="mt-8 rounded-[10px] font-semibold py-2 px-4 text-[14px] text-medium text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end" onClick={() => router.push('/signup')}>
            Sign Up to Discover All Features
          </button>
        </div>
      </div>
    </div>
  );
}
