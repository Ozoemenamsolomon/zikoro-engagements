"use client";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { formSettingSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { TwitterPicker } from "react-color";
import { useState } from "react";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { FormListingType, FormSlideType } from "@/constants";

function ColorPicker({
  form,
  close,
  name,
  colors,
}: {
  form: UseFormReturn<any, any, any>;
  close: () => void;
  name: any;
  colors: string[];
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className="absolute top-12"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          close();
        }}
        className="w-full h-full inset-0 fixed z-[100]"
      ></button>
      <div className="w-[200px] relative z-[150]">
        <TwitterPicker
          color={form.watch(name)}
          colors={colors}
          onChange={(color, event) => form.setValue(name, color.hex)}
          className="h-[250px] w-[200px]"
        />
      </div>
    </div>
  );
}
export function NumberSelectorWidget({
  name,
  value,
  form,
}: {
  value: string;
  name: string;
  form: UseFormReturn<any, any, any>;
}) {
  return (
    <div className="w-[200px] h-12 flex items-center justify-between rounded-md px-4 py-2 border">
      <input
        type="number"
        readOnly
        value={value}
        className="outline-none h-12 bg-transparent w-[40px] border-0 text-xl"
      />
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            form.setValue(name, String(parseInt(value) + 1));
          }}
        >
          <InlineIcon icon="iconamoon:arrow-up-2-thin" fontSize={28} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (parseInt(value) >= 1) {
              form.setValue(name, String(parseInt(value) - 1));
            }
          }}
          className="pb-2"
        >
          <InlineIcon icon="simple-line-icons:arrow-down" fontSize={14} />
        </button>
      </div>
    </div>
  );
}

export function ColorPickerWidget({
  name,
  className,
  form,
  currentColor,
  colors,
}: {
  form: UseFormReturn<any, any, any>;
  name: any;
  className?: string;
  currentColor: string;
  colors: string[];
}) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div
      className={cn("border h-12 flex items-center rounded-md p-1", className)}
    >
      <div
        style={{
          backgroundColor: currentColor || "#001ffc",
        }}
        onClick={() => setShowPicker((prev) => !prev)}
        className="relative h-full rounded-md w-[100px]"
      >
        {showPicker && (
          <ColorPicker
            close={() => setShowPicker((prev) => !prev)}
            form={form}
            name={name}
            colors={colors}
          />
        )}
      </div>
      <Input
        type="text"
        placeholder="#001FFC"
        readOnly
        {...form.register(name)}
        className="placeholder:text-sm border-0 w-[70px]  px-1 h-full text-zinc-700"
      />
    </div>
  );
}

const bgColors = [
  "#ffffff",
  "#B3B3B3",
  "#E6E6E6",
  "#FFBFB9",
  "#FFCC99",
  "#FFF9B3",
  "#F2F4B3",
  "#E4F4B3",
  "#CCF4F4",
  "#D1F4FF",
  "#E2DBFF",
  "#FFD6FF",
  "#999999",
  "#CCCCCC",
  "#F5F5F5",
  "#F7A8A0",
  "#FFCC99",
  "#FFEBB3",
  "#E8E8B3",
  "#D1EBB3",
  "#B3F2F2",
  "#99E4FF",
  "#D5CCFF",
  "#FFCCFF",
  "#666666",
  "#CCCCCC",
  "#E6E6E6",
  "#E6A5A3",
  "#E6A077",
  "#FFDD99",
  "#CCCC80",
  "#80B399",
  "#66CCCC",
  "#99C2E6",
  "#BFA6D9",
  "#E8A3E8",
];

const colors = [
  "#4D4D4D",
  "#999999",
  "#F44E3B",
  "#FE9200",
  "#FCDC00",
  "#DBDF00",
  "#A4DD00",
  "#68CCCA",
  "#73D8FF",
  "#AEA1FF",
  "#FDA1FF",
  "#333333",
  "#808080",
  "#cccccc",
  "#D33115",
  "#E27300",
  "#FCC400",
  "#B0BC00",
  "#68BC00",
  "#16A5A5",
  "#009CE0",
  "#7B64FF",
  "#FA28FF",
  "#000000",
  "#666666",
  "#B3B3B3",
  "#9F0500",
  "#C45100",
  "#FB9E00",
  "#808900",
  "#194D33",
  "#0C797D",
  "#0062B1",
  "#653294",
  "#AB149E",
];

function ColorWidget({
  form,
  title,
  name,
  currentColor,
  colorArray,
}: {
  title: string;
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
  name: string;
  currentColor: string;
  colorArray: string[];
}) {
  return (
    <div className="flex flex-col items-start justify-start gap-y-3">
      <p className="font-medium text-mobile sm:text-sm">{title}</p>
      <ColorPickerWidget
        colors={colorArray}
        name={name}
        form={form}
        currentColor={currentColor}
      />
    </div>
  );
}

function NumberWidget({
  form,
  title,
  name,
  value,
}: {
  title: string;
  form: UseFormReturn<any, any, any>;
  name: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-start justify-start gap-y-3">
      <p className="font-medium text-mobile sm:text-sm">{title}</p>
      <NumberSelectorWidget form={form} name={name} value={value} />
    </div>
  );
}

export default function FormAppearance({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSettingSchema>, any, any>;
}) {
  const isCoverImage = useWatch({
    control: form.control,
    name: "formSettings.isCoverImage",
  });
  const displayType = useWatch({
    control: form.control,
    name: "formSettings.displayType",
  });
  const textColor = useWatch({
    control: form.control,
    name: "formSettings.textColor",
  });
  const backgroundColor = useWatch({
    control: form.control,
    name: "formSettings.backgroundColor",
  });
  const buttonColor = useWatch({
    control: form.control,
    name: "formSettings.buttonColor",
  });
  // const titleFontSize = useWatch({
  //   control: form.control,
  //   name: "formSettings.titleFontSize",
  // });
  // const headingFontSize = useWatch({
  //   control: form.control,
  //   name: "formSettings.headingFontSize",
  // });
  // const textFontSize = useWatch({
  //   control: form.control,
  //   name: "formSettings.textFontSize",
  // });
  const questionPerSlides = useWatch({
    control: form.control,
    name: "formSettings.questionPerSlides",
  });

  const prevButtonText = useWatch({
    control: form.control,
    name: "formSettings.buttonText",
  });

  const hideNumber = useWatch({
    control: form.control,
    name: "formSettings.hideNumber",
  });

  // const prevStartButtonText = useWatch({
  //   control: form.control,
  //   name: "formSettings.startButtonText",
  // });
  return (
    <div className="w-full flex flex-col items-start justify-start gap-y-4 sm:gap-y-6">
      <div className="w-full flex items-center justify-between gap-x-4">
        <div className="flex flex-col items-start justify-start">
          <p className="font-medium text-mobile sm:text-sm">Cover Image</p>
          <p className="text-xs sm:text-mobile text-gray-500">
            Enable cover image of the form
          </p>
        </div>

        <Switch
          // disabled={loading}
          checked={isCoverImage}
          onCheckedChange={(checked) => {
            form.setValue("formSettings.isCoverImage", checked);
          }}
        
          
        />
      </div>
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Hide Number</p>
          {/* <p className="text-xs text-gray-500">
            User will see how the fill form immediately after the filling the
            form
          </p> */}
        </div>
        <Switch
          checked={hideNumber}
          onCheckedChange={(checked) =>
            form.setValue("formSettings.hideNumber", checked)
          }
          className=""
        />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-y-3">
        <div className="space-y-1">
          <p className="font-medium text-mobile sm:text-sm">Display Type</p>
          <p className="text-gray-500 text-xs">
            Pick your question display type
          </p>
        </div>
        <div className="flex sm:flex-row flex-col items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              form.setValue("formSettings.displayType", "listing");
            }}
            className={cn(
              "w-fit h-fit p-1 rounded-md border hover:border-basePrimary",
              displayType === "listing" && "border-basePrimary"
            )}
          >
            <FormListingType />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              form.setValue("formSettings.displayType", "slide");
            }}
            className={cn(
              "w-fit h-fit p-1 rounded-md border hover:border-basePrimary",
              displayType === "slide" && "border-basePrimary"
            )}
          >
            <FormSlideType />
          </button>
        </div>
      </div>
      <NumberWidget
        form={form}
        title="Question per slides"
        value={questionPerSlides!}
        name="formSettings.questionPerSlides"
      />
      <ColorWidget
        currentColor={backgroundColor}
        form={form}
        name="formSettings.backgroundColor"
        title="Background Color"
        colorArray={bgColors}
      />
      <ColorWidget
        currentColor={textColor}
        form={form}
        name="formSettings.textColor"
        title="Text Color"
        colorArray={colors}
      />
      <ColorWidget
        currentColor={buttonColor}
        form={form}
        name="formSettings.buttonColor"
        title="Button Color"
        colorArray={colors}
      />
      {/* <NumberWidget
        form={form}
        title="Form title font size"
        value={titleFontSize}
        name="formSettings.titleFontSize"
      />
      <NumberWidget
        form={form}
        title="Heading font size"
        value={headingFontSize}
        name="formSettings.headingFontSize"
      />
      <NumberWidget
        form={form}
        title="Text size"
        value={textFontSize}
        name="formSettings.textFontSize"
      /> */}

      <FormField
        control={form.control}
        name="formSettings.buttonText"
        render={({ field }) => (
          <InputOffsetLabel className="w-[150px]" label="End Button Text">
            <Input
              placeholder=""
              type="text"
              defaultValue={prevButtonText}
              {...form.register("formSettings.buttonText")}
              className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </InputOffsetLabel>
        )}
      />

   
    </div>
  );
}
