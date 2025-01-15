"use client";
import { Button } from "@/components/custom";
import { quizQuestionSchema } from "@/schemas/quiz";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { Slider } from "@mui/material";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export function RangeModal({
  close,
  value,
  form,
  name,
  max,
}: {
  value: number;
  close: () => void;
  form: UseFormReturn<z.infer<typeof quizQuestionSchema>>;
  name: "duration" | "points";
  max: number;
}) {
  const [chooseValue, setChosenValue] = useState(value);

  function handleValue(num: number) {
    setChosenValue(num);
  }
  return (
    <div
      onClick={close}
      role="button"
      className="w-full h-full fixed inset-0 z-[300] bg-black/50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-[95%] max-w-md m-auto h-fit text-sm absolute inset-0 bg-white rounded-lg p-3"
      >
        <div className="w-full flex items-center justify-between pb-3 border-b">
          <p>{name === "duration" ? "Question Duration" : "Question Points"}</p>
          <Button
            onClick={close}
            className="h-8 w-8 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
          >
            <InlineIcon
              icon={"mingcute:close-line"}
              fontSize={20}
              color="#ffffff"
            />
          </Button>
        </div>
        <div className="w-full flex items-center justify-center flex-col gap-6 h-[18rem]">
          <p>
            <span className="underline text-xl sm:text-3xl font-medium">
              {chooseValue}
            </span>{" "}
            {name === "duration" ? "Secs" : "Points"}
          </p>
          <div className="w-full grid items-center justify-center grid-cols-12">
            <span className="text-center">0</span>
            <div className="col-span-10 w-full">
              <Slider
                min={0}
                max={max}
                step={1}
                size="small"
                value={chooseValue}
                className="w-full h-1"
                onChange={(_, e) => {
                  handleValue(e as number);
                }}
                sx={{
                  color: "#6b7280",
                  height: 4,
                  padding: 0,
                  "& .MuiSlider-thumb": {
                    width: 8,
                    height: 8,
                    backgroundColor: "#ffffff",
                    transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                    "&:before": {
                      boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
                    },
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: `0px 0px 0px 6px #001fcc`,
                    },
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#001fcc",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "#6b7280",
                  },
                }}
              />
            </div>

            <span className="text-center">{max}</span>
          </div>

          <Button
            onClick={() => {
              form.setValue(name, String(chooseValue));
              close();
            }}
            className="font-medium text-white rounded-lg bg-basePrimary"
          >
           {name === "duration" ? "Update Duration" : "Update Points"}
          </Button>
        </div>
      </div>
    </div>
  );
}
