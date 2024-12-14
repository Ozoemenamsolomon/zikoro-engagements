"use client"
import { useRouter } from "next/navigation";
export default function Section5() {
  const router = useRouter()
  return (
    <div className="">
      <div
        className="mt-[80px] flex justify-center items-center bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end max-w-full  2xl:max-w-[1128px] mx-auto"
        style={{}}
      >
        {/* header text */}
        <div className="py-[100px] lg:py-[141px]">
          <p className="text-center font-extrabold text-4xl text-white ">
            Ready to Transform Your Engagements?
          </p>

          <div className="flex justify-center">
            <button className="mt-8 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-indigo-600 bg-white" onClick={() => router.push('/login')}>
              Get Started For Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
