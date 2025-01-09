"use client";
import React from "react";
import AppointmentLoginForm from "@/components/login/AppointmentLoginForm";

const AppointmentLoginPage = () => {
  return (
    <div className="items-center justify-center flex w-full h-screen " style={{
      backgroundImage: `url(/bgImg.webp)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <AppointmentLoginForm />
    </div>
  );
};

export default AppointmentLoginPage;
