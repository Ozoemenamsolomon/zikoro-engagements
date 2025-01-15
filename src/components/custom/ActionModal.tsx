"use client"

import {Button} from "@/components/custom"
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { AlertTriangleOutline } from "@styled-icons/evaicons-outline/AlertTriangleOutline";
import { cn } from "@/lib/utils";

export function ActionModal({
    close,
    asynAction,
    loading,
    buttonText,
    buttonColor
  }: {
    close: () => void;
    asynAction: () => Promise<any>;
    loading: boolean;
    buttonText: string;
    buttonColor?:string;
  }) {
    return (
      <div
        onClick={close}
        role="button"
        className="w-full h-full inset-0 fixed z-[300] bg-black/50"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-[95%] max-w-md rounded-xl bg-white absolute inset-0 m-auto h-fit px-4 py-6 flex flex-col items-center justify-center gap-y-14"
        >
          <div className="flex flex-col items-center justify-center gap-y-2">
            <AlertTriangleOutline size={50} className="text-basePrimary" />
            <p>Are you sure you want to continue?</p>
          </div>
  
          <div className="w-full flex items-end justify-end gap-x-3">
            <Button
            disabled={loading}
            onClick={close}>Cancel</Button>
  
            <Button
            disabled={loading}
              onClick={asynAction}
              className={cn("text-gray-50 bg-basePrimary w-[120px] gap-x-2", buttonColor)}
            >
              {loading && <LoaderAlt className="animate-spin" size={22} />}
              <p>{buttonText}</p>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  