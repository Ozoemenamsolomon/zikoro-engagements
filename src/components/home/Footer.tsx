"use client";
import Image from "next/image";
import { useState } from "react";
import {
  FooterMail,
  FooterMenu,
  NavModalIcon,
  NavModalIcon2,
} from "@/constants/icons";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const [isPreviewUp, setIsPreviewUp] = useState<boolean>(false);

  return (
    <div className=" bg-gradient-to-tr from-custom-bg-gradient-start to-custom-bg-gradient-end max-w-full mx-auto relative  border-t-[1px] border-dotted border-violet-500">
      {/* small screens Preview */}
      {isPreviewUp && (
        <div className="absolute block bottom-28 right-3 lg:hidden bg-white cursor-pointer rounded-[10px] p-3">
          {/* 1st app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Credentials
              </p>
              <p className="text-[11px] font-medium text-[#31353B] w-[232px]">
                Create, issue certificates and digital badges with ease.
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer"
              onClick={() =>
                window.open("https://credentials.zikoro.com/", "_blank")
              }
            >
              <NavModalIcon2 />
            </div>
          </div>

          {/* 2nd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Bookings
              </p>
              <p className="text-[11px] font-medium text-[#31353B] w-[232px]">
                Simplify appointment booking and scheduling for seamless
                coordination.{" "}
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() => router.push("https://bookings.zikoro.com/")}
            >
              <NavModalIcon2 />
            </div>
          </div>

          {/* 3rd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Events
              </p>
              <p className="text-[11px] font-medium text-[#31353B]  w-[232px]">
                Simplify appointment booking and scheduling for seamless
                coordination.
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() =>
                window.open("https://bookings.zikoro.com/", "_blank")
              }
            >
              <NavModalIcon2 />
            </div>
          </div>
        </div>
      )}

      {/* big screens Preview */}
      {isPreviewUp && (
        <div className="absolute bottom-32 right-64 hidden lg:flex flex-col cursor-pointer bg-white  rounded-[10px] p-3">
          {/* 2nd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Events
              </p>
              <p className="text-[12px] font-medium text-[#31353B] w-[282px]">
                Create event tickets, check-in attendees, send RSVPs and more.{" "}
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() => window.open("https://www.zikoro.com", "_blank")}
            >
              <NavModalIcon />
            </div>
          </div>

          {/* 3rd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Bookings
              </p>
              <p className="text-[12px] font-medium text-[#31353B]  w-[282px]">
                Simplify appointment booking and scheduling for seamless
                coordination.
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() =>
                window.open("https://bookings.zikoro.com/", "_blank")
              }
            >
              <NavModalIcon />
            </div>
          </div>

          {/* 4th app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Credentials
              </p>
              <p className="text-[12px] font-medium text-[#31353B]  w-[282px]">
                Create, issue certificates and digital badges with ease.
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() =>
                window.open("https://credentials.zikoro.com/", "_blank")
              }
            >
              <NavModalIcon />
            </div>
          </div>
        </div>
      )}

      {/* main content */}
      <div className="py-4 lg:py-[41px] lg:max-w-[970px] xl:max-w-[1200px] mx-auto flex justify-between items-center px-3 lg:px-0 ">
        {/* left */}
        <Image
          src={"/logo.png"}
          width={115}
          height={40}
          alt=""
          className="w-[115px] h-[40px] cursor-pointer"
          onClick={() => router.push("/")}
        />

        {/* right */}

        <ul className="flex gap-x-2 lg:gap-x-4">
          {/* First List Item */}
          <li
            className="flex flex-col gap-y-2 cursor-pointer justify-center items-center"
            onClick={() => setIsPreviewUp(!isPreviewUp)}
          >
            <FooterMenu />
            <span className="text-[10px] lg:text-base font-normal lg:font-medium">
              Other Products
            </span>
          </li>

          {/* Second List Item */}
          <li
            className="flex flex-col gap-y-2 cursor-pointer justify-center items-center"
            onClick={() => router.push("/contact")}
          >
            <FooterMail />
            <span className="text-[10px] lg:text-base font-normal lg:font-medium">
              Contact Us
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
