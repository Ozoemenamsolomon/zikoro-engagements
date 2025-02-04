"use client";

import { Button } from "@/components/custom";
import { useState } from "react";
import { ThreeDotsVertical } from "styled-icons/bootstrap";
import Image from "next/image";
import { DeleteForm, ActivateForm, CopyForm } from "./cardActions";

import { cn } from "@/lib/utils";
import {  TOrganizationForm} from "@/types/form";

export function FormCard({
  form,
  refetch,
}: {
  refetch: () => Promise<any>;
  form: TOrganizationForm;
}) {
  const [isOpen, setOpen] = useState(false);


  function onClose() {
    setOpen((prev) => !prev);
  }

  return (
    <div
      onClick={() => {
        window.open(
            `/e/${form?.workspaceAlias}/form/o/${
              (form as TOrganizationForm)?.formAlias
            }/add-question`,
            "_self"
          );
       
      }}
      role="button"
      className="w-full text-mobile  sm:text-sm bg-white rounded-md flex flex-col items-start justify-start"
    >
      <div className="w-full relative">
        <div className="absolute flex items-center justify-between inset-x-0 w-full  top-3 px-3">
          <p className="text-xs w-fit sm:text-sm rounded-3xl bg-basePrimary text-white px-3 py-1">
            form
          </p>
         
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-0 p-1 bg-gray-200/50 w-fit h-fit"
            >
              <ThreeDotsVertical size={20} />
              {isOpen && (
                <ActionModal refetch={refetch} close={onClose} form={form} />
              )}
            </Button>
    
        </div>

        {form?.coverImage &&
        (form?.coverImage as string).startsWith("https://") ? (
          <Image
            className="w-full rounded-t-md h-48 2xl:h-56 object-cover"
            alt="quiz"
            src={form?.coverImage}
            width={400}
            height={400}
          />
        ) : (
          <div className="w-full rounded-t-md h-48 2xl:h-56  bg-gray-200">
            {" "}
          </div>
        )}
      </div>
      <div className="w-full flex flex-col rounded-b-md items-start justify-start gap-y-3 border-x border-b">
        <p className="font-medium px-3 pt-3 w-full line-clamp-2">
          {form?.title}
        </p>
        <div className="text-gray-500 px-3 pb-3 text-xs ms:text-mobile flex items-center justify-between w-full">
          <p className="flex items-center gap-x-2">
            <span className={cn(" pr-2 border-gray-500")}>{`${
              form?.questions?.length || 0
            } ${form?.questions?.length > 1 ? "Questions" : "Question"}`}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionModal({
  close,
  refetch,
  form,
}: {
  refetch: () => Promise<any>;
  form: TOrganizationForm;
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
          <CopyForm form={form} refetch={refetch} />

          <ActivateForm form={form} refetch={refetch} />

          <DeleteForm formAlias={form?.formAlias} refetch={refetch} />
        </div>
      </div>
    </>
  );
}
