"use client";
import { CrossedEye } from "@/constants/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useRegistration } from "@/hooks/services/auth";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/schemas";

const AppointmentSignupForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { loading, register } = useRegistration();
  const form = useForm<z.infer<typeof registerSchema>>({});
  const {
    formState: { errors },
  } = form;

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await register(values);
  }

  return (
    <div className="py-[16px] lg:py-[37px] px-3 lg:px-[42px] rounded-[8px] max-w-full md:max-w-[542px] mx-auto ">
      <div className="flex justify-center ">
        <Image
          src="/appointments/logoFooter.png"
          width={115}
          height={40}
          alt=""
          className="w-[115px] h-[40px]"
        />
      </div>

      <p className="text-2xl text-indigo-600 text-center mt-10 font-semibold">
        Sign Up
      </p>
      <p className="mt-4 font-normal text-center">
        Get Started in Just 2 Minutes –
        <span className="block">
          Sign Up, Manage, and Issue Certificates with Ease!
        </span>
      </p>

      <form className="mt-10" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-3 mt-6">
          <label htmlFor="">Email Address</label>
          <input
            type="email"
            required
            {...form.register("email")}
            placeholder="Enter Email Address"
            className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
          />
          {errors?.email?.message && (
            <p className="mt-2 font-medium text-red-500 text-mobile">
              {errors?.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-3 mt-6">
          <label htmlFor="">Password</label>
          <div className="flex items-center justify-around border-[1px] border-gray-200 rounded-[6px] ">
            <input
              type={showPassword ? "text" : "password"}
              required
              {...form.register("password")}
              placeholder="Enter Password"
              className="w-[90%] px-[10px] py-4 h-full text-base  outline-none"
              minLength={8}
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              <CrossedEye />
            </div>
          </div>
          {errors?.password?.message && (
            <p className="mt-2 font-medium text-red-500 text-mobile">
              {errors?.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="py-4 px-3 text-base w-full rounded-[8px] font-semibold mt-10 mb-6 text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end"
        >
          {loading && <LoaderAlt size={22} className="animate-spin" />}
          Get Started
        </button>
      </form>

      {/* <div className="max-[400px]:hidden ">
        <OrIcon />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="py-4 px-3 flex items-center justify-center gap-x-2 text-base w-full rounded-[8px] mt-10 mb-6  border-[1px] border-gray-200"
      >
        <GoogleBlackIcon /> Sign Up with google
      </button> */}

      <p className="mt-[14px] text-center">
        Already have an account?{" "}
        <span
          className="text-indigo-400 cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default AppointmentSignupForm;
