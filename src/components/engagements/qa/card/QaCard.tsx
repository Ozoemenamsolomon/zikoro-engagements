"use client";

import { Button } from "@/components/custom";
import { useState } from "react";
import { ThreeDotsVertical } from "styled-icons/bootstrap";
import { ActivateQA, CopyQA, DeleteQA } from "./cardActions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TOrganizationQa } from "@/types/qa";

export function QaCard({
  qa,
  refetch,
}: {
  refetch: () => Promise<any>;
  qa: TOrganizationQa;
}) {
  const [isOpen, setOpen] = useState(false);
  const router = useRouter();

  function onClose() {
    setOpen((prev) => !prev);
  }

  return (
    <div
      onClick={() => {
        window.open(`/e/${qa?.workspaceAlias}/qa/o/${qa?.QandAAlias}`, "_self");
      }}
      role="button"
      className="w-full text-mobile  sm:text-sm bg-white rounded-md flex flex-col items-start justify-start"
    >
      <div className="w-full relative">
        <div className="absolute flex items-center justify-between inset-x-0 w-full  top-3 px-3">
          <p className="text-xs w-fit sm:text-sm rounded-3xl bg-basePrimary text-white px-3 py-1">
            Q & A
          </p>
          {
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-0 p-1 bg-gray-200/50 w-fit h-fit"
            >
              <ThreeDotsVertical size={20} />
              {isOpen && (
                <ActionModal refetch={refetch} close={onClose} qa={qa} />
              )}
            </Button>
          }
        </div>

        {qa?.coverImage && (qa?.coverImage as string).startsWith("https://") ? (
          <Image
            className="w-full rounded-t-md h-48 2xl:h-56 object-cover"
            alt="qa"
            src={qa?.coverImage}
            width={400}
            height={400}
            
          />
        ) : (
          <div className="w-full rounded-t-md h-48 2xl:h-56  bg-gray-200">
            {" "}
          </div>
        )}
      </div>
      <div className="w-full flex flex-col pb-3 rounded-b-md items-start justify-start gap-y-3 border-x border-b">
        <p className="font-medium px-3 pt-3 w-full line-clamp-2">
          {qa?.coverTitle}
        </p>
        {/* <div className="text-gray-500 px-3 pb-3 text-xs ms:text-mobile flex items-center justify-between w-full">
          <p className="flex items-center gap-x-2">
            <span className={cn(" pr-2 border-gray-500")}>{`${
              form?.questions?.length || 0
            } ${form?.questions?.length > 1 ? "Questions" : "Question"}`}</span>
          </p>
        </div> */}
      </div>
    </div>
  );
}

function ActionModal({
  close,
  refetch,
  qa,
}: {
  refetch: () => Promise<any>;
  qa: TOrganizationQa;
  close: () => void;
}) {
  return (
    <>
      <div className="absolute right-0 top-8  w-[140px]">
        <Button className="fixed inset-0 bg-none h-full w-full z-[100"></Button>
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex relative z-[50]  flex-col  py-4 items-start justify-start bg-white rounded-lg w-full h-fit shadow-lg"
        >
          <CopyQA qa={qa} refetch={refetch} />

          <ActivateQA qa={qa} refetch={refetch} />

          <DeleteQA QandAAlias={qa?.QandAAlias} refetch={refetch} />
        </div>
      </div>
    </>
  );
}
