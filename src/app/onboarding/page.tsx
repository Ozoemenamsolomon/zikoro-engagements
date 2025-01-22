import Onboarding from "@/components/onboarding/Onboarding";
import Image from "next/image";
import React from "react";

type SearchParamsType = {
  email: string;
  createdAt: string;
};

const OnboardingPage = ({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) => {
  return (
    <div>
      {/* large screen */}
      <div className="bg-[#f9faff] hidden lg:flex items-center">
        <div className="w-[50%] hidden lg:flex items-end [@media(min-width:2000px)]:items-center bg-gradient-to-tr from-concert-gradient-start to-concert-gradient-end h-screen">
          <Image
            src="/appointments/signupBanner.png"
            alt="banner"
            width={867}
            height={810}
            className=" mx-auto w-fit h-fit bg-contain"
          />
        </div>

        <div className="w-[50%]">
          <Onboarding searchParams={searchParams} />
        </div>
      </div>
      {/* small screen */}
      <div className="bg-[#f9faff] min-h-screen block lg:hidden">
        {/* banner */}
        <Image
          src="/appointments/signupBannerS.png"
          alt="banner"
          width={375}
          height={215}
          className="w-full h-full object-cover"
        />

        {/* dynamic components */}
        <Onboarding searchParams={searchParams} />
      </div>
    </div>
  );
};

export default OnboardingPage;
