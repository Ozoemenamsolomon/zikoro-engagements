import { Button } from "@/components/custom";
import { usePostRequest } from "@/hooks/services/requests";
import { cn } from "@/lib/utils";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  bgColors,
  ColorWidget,
  colors,
} from "../../form/formSettings/_components";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@mui/material";
import { Portal } from "@/components/custom/Portal";
import { uploadFile } from "@/utils";
import { TQuestion, TQuiz } from "@/types/quiz";

function PreMade({ form }: { form: UseFormReturn<TQuiz<TQuestion[]>> }) {
  const preMadeType = useWatch({
    control: form.control,
    name: "accessibility.preMadeType",
  });

  return (
    <div className="w-fit mx-auto flex items-start justify-start flex-col ">
      <div className="w-full flex flex-col sm:flex-row gap-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            form.setValue("accessibility.preMadeType", "/purple-bg.jpeg");
            form.setValue("accessibility.isPreMade", true);
          }}
          className={cn(
            "p-1 rounded-xl border",
            preMadeType === "/purple-bg.jpeg" && "border-basePrimary"
          )}
        >
          <Image width={200} height={200} alt="" src="/purpish.svg" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            form.setValue("accessibility.preMadeType", "/brown-bg.jpg");
            form.setValue("accessibility.isPreMade", true);
          }}
          className={cn(
            "p-1 rounded-xl border",
            preMadeType === "/brown-bg.jpg" && "border-basePrimary"
          )}
        >
          <Image width={200} height={200} alt="" src="/brown.svg" />
        </button>
      </div>
    </div>
  );
}

function Standard({ form }: { form: UseFormReturn<TQuiz<TQuestion[]>> }) {
  const isBackgroundImage = useWatch({
    control: form.control,
    name: "accessibility.isBackgroundImage",
  });
  const isBackgroundColor = useWatch({
    control: form.control,
    name: "accessibility.isBackgroundColor",
  });
  const textColor = useWatch({
    control: form.control,
    name: "accessibility.textColor",
  });
  const backgroundColor = useWatch({
    control: form.control,
    name: "accessibility.backgroundColor",
  });
  const buttonColor = useWatch({
    control: form.control,
    name: "accessibility.buttonColor",
  });
  const backgroundBrightness = useWatch({
    control: form.control,
    name: "accessibility.backgroundBrightness",
  });
  //

  const coverImg = form.watch("accessibility.backgroundImage");
  const addedImage = useMemo(() => {
    if (typeof coverImg === "string") {
      return coverImg;
    } else if (coverImg && coverImg[0]) {
      return URL.createObjectURL(coverImg[0]);
    } else {
      return null;
    }
  }, [coverImg]);

  console.log("dsfs", coverImg);

  return (
    <div className="w-full flex gap-4 items-start justify-start flex-col ">
      <div className="w-full flex items-center justify-between gap-x-4">
        <div className="flex flex-col items-start justify-start">
          <p className="font-medium text-mobile sm:text-sm">Background Color</p>
          <p className="text-xs sm:text-mobile text-gray-500">
            Enabling this option will replace background image
          </p>
        </div>

        <Switch
          // disabled={loading}
          checked={isBackgroundColor}
          onCheckedChange={(checked) => {
            form.setValue("accessibility.isBackgroundColor", checked);
            form.setValue("accessibility.isBackgroundImage", false);
          }}
        />
      </div>
      <ColorWidget
        currentColor={backgroundColor || "#ffffff"}
        form={form}
        name="accessibility.backgroundColor"
        title="Background Color"
        colorArray={bgColors}
      />
      <ColorWidget
        currentColor={textColor || "#000000"}
        form={form}
        name="accessibility.textColor"
        title="Text Color"
        colorArray={colors}
      />
      <ColorWidget
        currentColor={buttonColor || "#001fcc"}
        form={form}
        name="accessibility.buttonColor"
        title="Button Color"
        colorArray={colors}
      />

      <div className="w-full flex items-center justify-between gap-x-4">
        <div className="flex flex-col items-start justify-start">
          <p className="font-medium text-mobile sm:text-sm">Background Image</p>
          <p className="text-xs sm:text-mobile text-gray-500">
            Enabling this option will replace background color
          </p>
        </div>

        <Switch
          // disabled={loading}
          checked={isBackgroundImage}
          onCheckedChange={(checked) => {
            form.setValue("accessibility.isBackgroundImage", checked);
            form.setValue("accessibility.isBackgroundColor", false);
          }}
        />
      </div>

      <UploadImage
        image={addedImage}
        name="accessibility.backgroundImage"
        form={form}
      />

      <div className="w-full flex flex-col gap-3 items-start justify-start max-w-sm">
        <p className="font-medium text-mobile sm:text-sm">
          Background Image Brightness
        </p>

        <div className="w-full grid items-center justify-center grid-cols-12">
          <span className="text-center">0</span>
          <div className="col-span-10 w-full">
            <Slider
              min={0}
              max={2}
              step={0.1}
              size="small"
              value={backgroundBrightness}
              className="w-full h-1"
              onChange={(_, e) => {
                form.setValue(
                  "accessibility.backgroundBrightness",
                  e as number
                );
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

          <span className="text-center">2</span>
        </div>
      </div>
    </div>
  );
}

export function QuizThemeSettings({
  close,
  quiz,
}: {
  quiz: TQuiz<TQuestion[]>;
  close: () => void;
}) {
  const [active, setActive] = useState(0);
  const { postData } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [loading, setLoading] = useState(false);
  const [, setshowing] = useState(false);

  const form = useForm<TQuiz<TQuestion[]>>({
    defaultValues: {
      accessibility: {
        backgroundBrightness: 1,
        preMadeType: "",
        textColor: "#000000",
        backgroundColor: "#ffffff",
        isPreMade: false,
        buttonColor: "#001FFC",
        isBackgroundImage: false,
        isBackgroundColor: false,
        ...quiz?.accessibility,
      },
    },
  });

  console.log("vakue", form.getValues());

  console.log(form.formState.errors);
  async function onSubmit(values: TQuiz<TQuestion[]>) {
    setLoading(true);

    const image = await new Promise(async (resolve) => {
      if (
        typeof values?.accessibility?.backgroundImage === "string" &&
        values?.accessibility?.backgroundImage.length > 0
      ) {
        resolve(values?.accessibility?.backgroundImage);
      } else if (
        values?.accessibility?.backgroundImage &&
        values?.accessibility?.backgroundImage[0]
      ) {
        const img = await uploadFile(
          values?.accessibility?.backgroundImage[0],
          "image"
        );
        resolve(img);
      } else {
        resolve("");
      }
    });

    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      ...values,
      accessibility: {
        ...values?.accessibility,
        isPreMade:
          values?.accessibility?.isBackgroundImage ||
          values?.accessibility?.isBackgroundColor
            ? false
            : values?.accessibility?.isPreMade,
        backgroundImage: image as string,
      },
    };
    await postData({ payload });
    setLoading(false);
  }

  useEffect(() => {
    setshowing(true);
  }, [quiz]);
  return (
    <Portal>
      <div
        onClick={close}
        className="w-screen h-screen fixed inset-0 bg-black/50 z-[200] "
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="right-0 max-h-[85%] inset-0 h-fit m-auto animate-float-in border vert-scroll inset-y-0 absolute max-w-3xl w-full bg-white rounded-xl overflow-y-auto"
        >
          <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
            <div className="w-full flex items-center justify-between">
              <h2>Theme</h2>
              <Button
                onClick={close}
                className="h-10 w-10 px-0  flex items-center justify-center self-end rounded-full bg-zinc-700"
              >
                <InlineIcon
                  icon={"mingcute:close-line"}
                  fontSize={22}
                  color="#ffffff"
                />
              </Button>
            </div>

            <div className="w-fit my-3 mx-auto flex items-center justify-center border rounded-xl p-1 gap-x-2">
              {
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActive(0);
                  }}
                  className={cn(
                    "w-fit h-11 px-12 max-w-[200px] bg-basePrimary-100 rounded-xl",
                    active === 0 && "bg-basePrimary text-white"
                  )}
                >
                  Pre-Made
                </button>
              }
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActive(1);
                }}
                className={cn(
                  "w-fit h-11 px-10 max-w-[200px] bg-basePrimary-100 rounded-xl",
                  active === 1 && "bg-basePrimary text-white"
                )}
              >
                Standard
              </button>
            </div>

            <h2 className="font-semibold mx-auto text-center mb-3">
              {active === 0
                ? "Choose from our pre-made themes"
                : "Customize the look of your quiz"}
            </h2>

            <div
              onClick={(e) => {
                e.stopPropagation();
                //e.preventDefault();
              }}
              className="w-full"
            >
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full mx-auto flex  flex-col"
              >
                {active === 0 && <PreMade form={form} />}
                {active === 1 && <Standard form={form} />}

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-fit self-center gap-x-2 mt-12 text-white font-medium bg-basePrimary rounded-xl px-8"
                >
                  {loading && (
                    <Loader2Icon size={20} className="animate-spin" />
                  )}
                  Apply
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function UploadImage({
  image,
  name,
  form,
}: {
  name: string;
  form: UseFormReturn<z.infer<any>, any, any>;
  image: string | null;
}) {
  return (
    <div className=" rounded-lg p-4 border w-full overflow-hidden bg-basePrimary-100 h-52 flex flex-col items-center justify-center relative">
      <p>Upload Background Image</p>

      {image && (
        <Image
          src={image}
          width={500}
          height={600}
          className="w-full h-72 inset-0 z-10 object-cover rounded-lg absolute"
          alt=""
        />
      )}
      <label htmlFor="bg-image" className="w-full h-full absolute inset-0 z-20">
        <input
          id="bg-image"
          type="file"
          {...form.register(name)}
          accept="image/*"
          className="w-full h-full z-30 absolute inset-0 "
          hidden
        />
      </label>
    </div>
  );
}
