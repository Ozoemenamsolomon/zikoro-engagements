"use client";

import { ArrowLeftIcon, engagementHomeLinks } from "@/constants";
import Link from "next/link";
import { ZikoroImage } from "../custom";
import useUserStore from "@/store/globalUserStore";

export default function Dashboard() {
  const { user } = useUserStore();
  return (
    <div className="w-full space-y-6 mt-8 sm:mt-10 sm:space-y-8">
      <div className="flex flex-col items-start gap-y-2  justify-start">
        <p className="text-sm sm:text-desktop">
          Hello{" "}
          <span className="font-medium text-base sm:text-xl capitalize">
            {user?.firstName ?? ""}
          </span>
        </p>
        <p>What engagement feature will you be using today?</p>
      </div>
      <div className="w-full py-4 overflow-x-auto no-scrollbar">
        <div className="w-full min-w-max flex items-center gap-3 sm:gap-4">
          {engagementHomeLinks.map((nav, index) => (
            <ActionCard
              key={index}
              Icon={nav.Icon}
              name={nav.name}
              href={nav.link}
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
    </div>
  );
}

function ActionCard({
  Icon,
  name,
  href,
}: {
  Icon: React.ElementType;
  name: string;
  href: string;
}) {
  return (
    <div className="w-[100px] h-[100px] rounded-lg p-4 bg-white sm:w-[200px] relative sm:h-[200px] gap-3 flex flex-col items-center justify-center">
      <Icon />
      <p>{name}</p>
      <Link
        href={""}
        className="w-10 h-10 rounded-full flex absolute items-center border justify-center bottom-3 right-4"
      >
        <ArrowLeftIcon />
      </Link>
    </div>
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
      <div className="w-full col-span-5 flex flex-col items-start justify-start gap-3">
        <p className="font-semibold text-desktop sm:text-lg">Engagement Name</p>
        <p className="w-full text-gray-500 line-clamp-3 ">description</p>

        <p>Questions</p>
      </div>
    </div>
  );
}
