import { Button } from "@/components/custom";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { TQa } from "@/types/qa";
import { QaSetting } from "./modals/QaSettings";
import { Settings } from "styled-icons/feather";
import { InlineIcon } from "@iconify/react";

type TopSectionProp = {
  allQuestionsCount: number;
  myQuestionsCount: number;
  awaitingReviewCount?: number;
  isAttendee?: boolean;
  activeState: number;
  setActiveState: (i: number) => void;
  filterValue: string;
  qa?: TQa;
  workspaceAlias: string;
  refetch?: (t?:boolean) => Promise<any>;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
};

export function TopSection({
  allQuestionsCount = 0,
  awaitingReviewCount = 0,
  myQuestionsCount = 0,
  isAttendee,
  activeState,
  setActiveState,
  filterValue,
  setFilterValue,
  qa,
  workspaceAlias,
  refetch
}: TopSectionProp) {
  const [isOpen, setOpen] = useState(false);
  const [isShowSelectMobile, setShowSelectMobile] = useState(false);
  const filters = [
    { value: "Recent", label: "Recent" },
    { value: "Top Liked", label: "Top Liked" },
  ];

  function onClose() {
    setOpen((p) => !p);
  }

  return (
    <div className="w-full  sticky z-10 top-0">
      <div
        className={cn(
          " w-full bg-white px-4 sm:px-6 flex items-center text-sm justify-between sm:justify-center gap-2 sm:gap-8 md:gap-16",
          !isAttendee && "justify-around"
        )}
      >
        <button
          onClick={() => setActiveState(1)}
          className={cn(
            "px-2 py-4 flex items-center gap-x-1 text-sm",
            activeState === 1 && "text-basePrimary border-b border-basePrimary"
          )}
        >
          <p>All Questions</p>
          <span className="text-xs font-medium px-2 py-1 flex items-center justify-center rounded-full bg-basePrimary text-white">
            {allQuestionsCount}
          </span>
        </button>
        <button
          onClick={() => setActiveState(2)}
          className={cn(
            "px-2 py-4 flex items-center gap-x-1 text-sm",
            activeState === 2 && "text-basePrimary border-b border-basePrimary"
          )}
        >
          <p>My Questions</p>
          <span className="text-xs font-medium px-2 py-1 flex items-center justify-center rounded-full bg-basePrimary text-white">
            {myQuestionsCount}
          </span>
        </button>
        {!isAttendee && (
          <button
            onClick={() => setActiveState(3)}
            className={cn(
              "px-2 py-4 flex items-center gap-x-1 text-sm",
              activeState === 3 &&
                "text-basePrimary border-b border-basePrimary"
            )}
          >
            <p>Awaiting Review</p>
            <span className="text-xs font-medium px-2 py-1 flex items-center justify-center rounded-full bg-basePrimary text-white">
              {awaitingReviewCount}
            </span>
          </button>
        )}

        <div className="flex items-center gap-x-3">
          {!isAttendee && (
            <button className="hidden sm:block" onClick={onClose}>
              <Settings size={22} />
            </button>
          )}
          <Button
            onClick={() => setShowSelectMobile((p) => !p)}
            className="px-0 relative flex sm:hidden w-fit h-fit"
          >
            <InlineIcon fontSize={22} icon="material-symbols-light:menu" />

            {isShowSelectMobile && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-7"
              >
                <div
                  onClick={() => setShowSelectMobile(false)}
                  className="w-full h-full inset-0 fixed z-[100]"
                ></div>
                <div className="relative z-[999] p-3 rounded-lg h-fit flex flex-col items-start justify-start gap-y-2 bg-white w-[150px]">
                  <Select
                    onValueChange={(value) => {
                      setFilterValue(value);
                      setShowSelectMobile(false);
                    }}
                    defaultValue={filterValue}
                  >
                    <SelectTrigger className="h-11 w-[150px]">
                      <SelectValue placeholder="Select Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        {filters.map(({ value, label }, index) => (
                          <SelectItem
                            key={index}
                            className="h-12 items-center justify-start focus:bg-gray-100"
                            value={value}
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {!isAttendee && (
                    <button
                      className="flex sm:hidden text-mobile items-center gap-x-2"
                      onClick={() => {
                        onClose();
                        setShowSelectMobile(false);
                      }}
                    >
                      <Settings size={18} />
                      <p>Settings</p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Button>
          <div className="hidden sm:block">
            <Select
              onValueChange={(value) => setFilterValue(value)}
              defaultValue={filterValue}
            >
              <SelectTrigger className="h-11 w-[180px]">
                <SelectValue placeholder="Select Filter" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  {filters.map(({ value, label }, index) => (
                    <SelectItem
                      key={index}
                      className="h-12 items-center justify-start focus:bg-gray-100"
                      value={value}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isOpen && (
        <QaSetting
          close={onClose}
          workspaceAlias={workspaceAlias}
          qa={qa}
          refetch={refetch}
        />
      )}
    </div>
  );
}
