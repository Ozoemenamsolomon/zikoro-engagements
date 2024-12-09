"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronDown } from "styled-icons/bootstrap";
import { ThreeLineCircle, XCircle } from "@/constants/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import logo from "@/public/logo.png";
import bPreview from "@/public/otherPreviewB.png";
import sPreview from "@/public/OtherTopPrevS.png";

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOn, setIsPreviewOn] = useState<boolean>(false);
  const [isPreviewShowing, setIsPreviewShowing] = useState<boolean>(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="py-6 px-3 md:px-6 relative ">
      <div className=" bg-white flex items-center lg:max-w-[970px] xl:max-w-[1165px] py-3 px-3 md:px-6 lg:px-[36px] rounded-[64px] justify-between mx-auto shadow  ">
        <Image
          src={logo}
          width={115}
          height={40}
          alt=""
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />

        <div className="gap-x-8 hidden lg:flex ">
          <p
            className="text-base font-medium cursor-pointer flex gap-2 items-center"
            onClick={() => setIsPreviewShowing(!isPreviewShowing)}
          >
            <span>Other Products</span> <ChevronDown size={20} />
          </p>

          <p
            onClick={() => router.push("/contact")}
            className="text-base font-medium cursor-pointer"
          >
            Contact us
          </p>
        </div>

        <div className=" border-[1px] border-gray-200 rounded-[51px] hidden lg:flex gap-x-4 p-3 ">
          <SignupBtn />
          <SigninBtn />
        </div>

        <div className="lg:hidden">
          <button className="text-black" onClick={toggleMenu}>
            {isOpen ? <XCircle /> : <ThreeLineCircle />}
          </button>
        </div>
      </div>

      {/* preview modal */}
      {isPreviewShowing && (
        <div className="absolute cursor-pointer hidden lg:block left-96 ">
          <Image
            src={bPreview}
            className="w-[577px] h-[307px]"
            alt=""
            height={307}
            width={577}
            onClick={() => router.push("https://www.zikoro.com/")}
          />
        </div>
      )}

      {isOpen && (
        <div className="bg-violet-100 flex-col absolute p-[30px] mt-3 w-full max-w-[92%] lg:hidden rounded-[8px]">
          <ul className="">
            <li
              className="font-medium "
              onClick={() => setIsPreviewShowing(!isPreviewShowing)}
            >
              Other Products <ChevronDown size={20} />{" "}
              {isPreviewShowing && (
                <Image
                  src={sPreview}
                  width={273}
                  height={278}
                  alt=""
                  className="mt-[19px] w-[273px] h-[278px] block lg:hidden"
                  onClick={() => router.push("https://www.zikoro.com")}
                />
              )}
            </li>
            <li
              className="mt-5 font-medium "
              onClick={() => router.push("/contact")}
            >
              Contact Us{" "}
            </li>
          </ul>

          <div className=" border-[1px] border-gray-300 rounded-[51px] flex gap-x-4 p-3 mt-[72px] items-center w-fit mx-auto ">
            <SignupBtn />
            <SigninBtn />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

const SignupBtn = () => {
  return (
    <Link
      href={"/signup"}
      className="text-base px-[20px] py-[10px] text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end rounded-[28px]"
    >
      Sign Up
    </Link>
  );
};
const SigninBtn = () => {
  return (
    <Link
      href={"/login"}
      className="text-base px-[20px] py-[10px] text-indigo-700 bg-transparent border border-indigo-800 rounded-[28px]"
    >
      Login
    </Link>
  );
};
