"use client";
import React from "react";
import AppointmentLoginForm from "@/components/login/AppointmentLoginForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentLoginPage = () => {
  return (
    <div className=" flex items-center w-full h-screen ">
      <div className="w-[50%] hidden lg:flex items-center bg-gradient-to-tr from-concert-gradient-start to-concert-gradient-end h-screen">
        <Image
          src="/appointments/signupBanner.png"
          alt="banner"
          width={867}
          height={810}
          className=" mx-auto w-fit h-fit bg-contain"
        />
      </div>
      <div className="w-full lg:w-[50%]">
        <AppointmentLoginForm />
      </div>
    </div>
  );
};

export default AppointmentLoginPage;
