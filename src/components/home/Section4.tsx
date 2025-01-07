"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

export default function Section2() {
  return (
    <div>
      <div className=" mt-[52px] lg:mt-[80px] max-w-full lg:max-w-[1128px] mx-auto">
        <p className="text-center text-2xl lg:text-[32px] font-bold mb-8 lg:mb-[60px]">
          Perfect for Every Occasion
        </p>

        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          //   navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper "
        >
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3 mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Corporate Events</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Engage employees and stakeholders with{" "}
                    <br className="hidden lg:block" /> interactive polls and Q&A
                    sessions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={"/slider4.png"}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Online Community</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Engage employees and stakeholders with <br className="hidden lg:block" /> interactive
                    polls and Q&A sessions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={"/slider3.png"}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Corporate Events</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Make learning interactive with quizzes and <br className="hidden lg:block" /> word
                    clouds.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={"/slider2.png"}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Corporate Events</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Elevate audience participation with live{" "}
                    <br className="hidden lg:block" /> engagement tools.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={"/slider1.png"}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
