import React from "react";
import AppointmentSignupForm from "@/components/signup/AppointmentSignupForm";
import Banner from "@/public/bgImg.png";
import Image from "next/image";

const AppointmentSignupPage = () => {
  return (
    <div className="flex items-center w-full h-screen ">
      <div className="w-[50%] hidden lg:flex items-end [@media(min-width:2000px)]:items-center bg-gradient-to-tr from-concert-gradient-start to-concert-gradient-end h-screen">
        <Image
          src="/appointments/signupBanner.png"
          alt="banner"
          width={867}
          height={810}
          className="mx-auto bg-contain"
        />
      </div>

      <div className="w-full lg:w-[50%]">
        <AppointmentSignupForm />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
