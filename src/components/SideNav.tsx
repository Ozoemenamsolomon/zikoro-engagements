"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FeedbackIcon, navLinks, ReferIcon, SupportIcon } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import { InlineIcon } from "@iconify/react";
import { useState } from "react";
import useUserStore from "@/store/globalUserStore";
import { FeedBack } from "./feedback/FeedBack";

export function SideBarLayout({ children }: { children: React.ReactNode }) {
  const [isSideNav, setSideNav] = useState(false);
  const [isFeedBack, setIsFeedback] = useState(false);
  function onClose() {
    setSideNav((prev) => !prev);
  }

  return (
    <>
      <div
        className={cn(
          "w-full sm:w-[calc(100%-60px)]  float-right right-0 z-[48]  top-0 flex justify-between items-center ",
          isSideNav && "w-[calc(100%-60px)]"
        )}
      >
        <div className="xl:w-[calc(100%-250px)] max-w-7xl mx-auto px-4  min-[1280px]:float-right w-full">
          {children}
        </div>

        <SideNav
          isNav={isSideNav}
          close={onClose}
          openFeedback={() => setIsFeedback(true)}
        />
      </div>
      {isFeedBack && <FeedBack close={() => setIsFeedback(false)} />}
    </>
  );
}

export default function SideNav({
  isNav,
  close,
  openFeedback
}: {
  isNav: boolean;
  close: () => void;
  openFeedback: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        id="sidebar"
        className={`fixed transition-all duration-300 transform ease-in-out group inset-y-0 left-0 h-full ${
          isNav
            ? "bg-white/50 block z-[48] group-hover:w-[180px] group-hover:sm:w-[180px] w-[60px]"
            : " z-[48] max-[642px]:hidden group-hover:w-[180px] group-hover:sm:w-[180px] w-[60px]"
        }`}
      >
        <div className="transform transition-all  duration-300 group-hover:w-[180px] group-hover:sm:w-[180px] w-[60px] relative  min-h-screen bg-white py-3">
          <div className="px-3 mb-8">
            <Image
              src="/logo.png"
              alt="logo"
              className="group-hover:block  hidden"
              width={150}
              height={60}
            />
            <Image
              src="/zikoro-icon.png"
              alt="logo"
              className="group-hover:hidden block "
              width={50}
              height={50}
            />
          </div>
          <div className="w-full h-[40vh] overflow-y-auto no-scrollbar">
            <div className="w-full flex  flex-col gap-y-3 items-start justify-start px-3">
              {navLinks.slice(0, 2).map((nav, index) => (
                <Navs
                  key={index}
                  actionFn={close}
                  as={Link}
                  href={nav.link}
                  navName={nav.name}
                  isActive={pathname === nav.link}
                  Icon={nav.Icon}
                />
              ))}
            </div>
          </div>

          <div className="w-full h-[35vh]">
            <div className="w-full border-y  py-3 flex flex-col items-start justify-start gap-y-3">
              <Navs as="a" href="/referrals" navName="Refer & Earn" Icon={ReferIcon} />
              <Navs as="div" navName="Support" Icon={SupportIcon} />
              <Navs as="div" actionFn={openFeedback} navName="Feedback" Icon={FeedbackIcon} />
            </div>
          </div>
          <div className="absolute bottom-2 w-full px-3 inset-x-0">
            <div className="flex p-2 w-full rounded-lg bg-basePrimary-100  items-center gap-x-2">
              <InlineIcon icon="uim:user-nurse" fontSize={24} />
              <p className="text-ellipsis group-hover:block hidden capitalize whitespace-nowrap w-full overflow-hidden max-w-[8rem] ">
                {user?.firstName ?? "User"}
              </p>
            </div>
            <button
              onClick={() => {
                if (typeof window !== undefined) {
                  localStorage.clear();
                  router.push("/");
                }
              }}
              className="flex p-2 mt-2  w-full rounded-lg bg-basePrimary-100  items-center gap-x-2"
            >
              <InlineIcon icon="solar:logout-3-bold-duotone" fontSize={24} />
              <p className="text-ellipsis group-hover:block hidden whitespace-nowrap w-full overflow-hidden max-w-[8rem] ">
                LogOut
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Navs({
  as: Component = "div",
  Icon,
  isActive = false,
  navName,
  href,
  actionFn,
}: {
  as?: React.ElementType;
  Icon: React.ElementType;
  isActive?: boolean;
  navName: string;
  href?: string;
  actionFn?: () => void;
}) {
  return (
    <Component
      href={href}
      onClick={actionFn}
      className={cn(
        "flex items-center group-hover:justify-start justify-center w-full gap-x-2 p-2 rounded-lg",
        isActive && "bg-basePrimary-100"
      )}
    >
      <Icon />
      <p className="group-hover:block hidden">{navName}</p>
    </Component>
  );
}
