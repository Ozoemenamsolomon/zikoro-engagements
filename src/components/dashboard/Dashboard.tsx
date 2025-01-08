"use client";

import { ArrowLeftIcon, engagementHomeLinks } from "@/constants";
import Link from "next/link";
import { ZikoroImage } from "../custom";
import useUserStore from "@/store/globalUserStore";
import { useState } from "react";
import { CreateEngagement } from "./_components/CreateEngagement";

export default function Dashboard() {
  const { user } = useUserStore();
  const [isOpen, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  function onClose() {
    setOpen((prev) => !prev);
  }
  function showModal(type: number) {
    setOpen(true);
    setCurrentIndex(type);
  }
  return (
    <div className="w-full mt-8 sm:mt-10 ">
      <div className="flex flex-col items-start gap-y-2 mb-4 sm:mb-6 justify-start">
        <p className="text-sm sm:text-desktop">
          Hello{" "}
          <span className="font-medium text-base sm:text-xl capitalize">
            {user?.firstName ?? ""}
          </span>
        </p>
        <p>What engagement feature will you be using today?</p>
      </div>
      <div className="w-full py-4  mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
        <div className="w-full min-w-max flex items-center gap-3 sm:gap-4">
          {engagementHomeLinks.map((nav, index) => (
            <ActionCard
              key={index}
              index={index}
              Icon={nav.Icon}
              name={nav.name}
              href={nav.link}
              showCreate={showModal}
            />
          ))}
        </div>
      </div>
      <div className="w-full bg-white p-4 rounded-lg">
        <h2 className="font-medium mb-3 sm:mb-6">Engagements</h2>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(5)].map((_, index) => (
            <HomeEngagementCard key={index} />
          ))}
        </div>
      </div>
      {isOpen && <CreateEngagement close={onClose} type={currentIndex} />}
    </div>
  );
}

function ActionCard({
  Icon,
  name,
  index,
  showCreate,
}: {
  Icon: React.ElementType;
  name: string;
  href: string;
  index: number;
  showCreate: (t: number) => void;
}) {
  return (
    <button
      onClick={() => showCreate(index)}
      className="w-[100px] h-[100px] rounded-lg p-4 bg-white sm:w-[200px] relative sm:h-[200px] gap-3 flex flex-col items-center justify-center"
    >
      <Icon />
      <p>{name}</p>
      <div className="w-4 sm:w-10 h-4 sm:h-10 rounded-full flex absolute items-center border justify-center bottom-3 right-4">
        <ArrowLeftIcon />
      </div>
    </button>
  );
}

function HomeEngagementCard() {
  return (
    <div className="w-full rounded-lg gap-3 text-sm border border-basePrimary-100 p-3 grid grid-cols-7">
      <ZikoroImage
        src=""
        alt="engagement"
        className="w-full h-[100px] rounded-lg col-span-2"
        width={200}
        height={200}
      />
      <div className="w-full col-span-5 flex items-start justify-between">
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <p className="font-semibold text-desktop sm:text-lg">
            Engagement Name
          </p>
          <p className="w-full text-gray-500 line-clamp-3 ">description</p>

          <p>Questions</p>
        </div>
        <p className="border border-basePrimary rounded-3xl h-8 flex items-center justify-center px-3 bg-basePrimary gradient-text">
          Q&A
        </p>
      </div>
    </div>
  );
}
