import HomeImage from "@/public/home1.png";
export default function Section1() {
  return (
    <>
      {/* big screen */}
      <div
        className="bg-cover bg-no-repeat flex justify-center h-[calc(100vh-30px)]  2xl:h-[40vh] [@media(min-width:3000px)]:h-[20vh] w-full max-w-full 2xl:max-w-[1128px] mx-auto "
        style={{
          backgroundImage: `url(${HomeImage.src})`,
        }}
      >
        {/* header text */}
        <div className="pt-[37px] lg:pt-[80px]">
          <p className="text-center font-extrabold text-3xl lg:text-4xl gradient-text bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end ">
            Supercharge Interactions with Zikoro engagement
          </p>
          <p className=" text-[#555555] text-center font-medium text-base lg:text-xl mt-4 ">
            Engage your audience like never before with interactive quizzes,
            polls, Q&A, <br /> word clouds, and customizable forms.
          </p>
          <div className="flex justify-center">
            <button className="mt-8 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end">
              Get Started For Free
            </button>
          </div>
        </div>
      </div>

      {/* small screen */}
    </>
  );
}
