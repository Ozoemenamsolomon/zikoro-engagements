import { Button } from "@/components/custom";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formSettingSchema } from "@/schemas";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { useMemo, useState } from "react";
import { TEngagementFormQuestion } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostRequest } from "@/hooks/services/requests";
import { Loader2Icon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
function FieldSettings({
  close,
  engagementForm,
}: {
  engagementForm: TEngagementFormQuestion;
  close: () => void;
}) {
  const { postData } =
    usePostRequest<Partial<TEngagementFormQuestion>>("engagements/form");
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSettingSchema>>({
    resolver: zodResolver(formSettingSchema),
    defaultValues: {
      title: engagementForm?.title,
      coverImage: engagementForm?.coverImage,
      description: engagementForm?.description,
      formSettings: {
        ...engagementForm?.formSettings,
        endScreenSettings: {
          title: "Thanks for completing the form",
          subText: "This is all for now",
          buttonText: "Create Form",
          buttonUrl: "",
          x: "",
          linkedIn: "",
          instagram: "",
          facebook: "",
          website: "",
          showButton: true,
          socialLink: true,
          ...engagementForm?.formSettings?.endScreenSettings,
        },
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSettingSchema>) {
    setLoading(true);

    const payload: Partial<TEngagementFormQuestion> = {
      ...engagementForm,
      ...values,
    };
    await postData({ payload });
    setLoading(false);
  }

  const showButton = useWatch({
    control: form.control,
    name: "formSettings.endScreenSettings.showButton",
  });

  const showSocialLink = useWatch({
    control: form.control,
    name: "formSettings.endScreenSettings.socialLink",
  });

  return (
    <div
      onClick={close}
      className="w-screen h-screen fixed inset-0 bg-white/50 z-[100] "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="right-0 min-h-screen animate-float-in border vert-scroll inset-y-0 absolute max-w-3xl w-full bg-white overflow-y-auto"
      >
        <div className="w-full flex flex-col items-start p-4 justify-start gap-3">
          <div className="w-full flex items-center justify-between">
            <h2>End Screen Setting</h2>
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

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex gap-3 flex-col items-start justify-start mt-6"
            >
              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.title"
                render={({ field }) => (
                  <InputOffsetLabel className="w-full" label="Title">
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register("formSettings.endScreenSettings.title")}
                      className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.subText"
                render={({ field }) => (
                  <InputOffsetLabel className="w-full" label="Sub Text">
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.subText"
                      )}
                      className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                <div className="flex flex-col items-start justify-start">
                  <p className="font-medium text-mobile sm:text-sm">
                    Option Labels
                  </p>
                  <p className="text-xs text-gray-500">
                    Display labels for answer choices when enabled.
                  </p>
                </div>
                <Switch
                  checked={showButton}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "formSettings.endScreenSettings.showButton",
                      checked
                    )
                  }
                  className=""
                />
              </div>
              {/** second section */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.buttonText"
                render={({ field }) => (
                  <InputOffsetLabel className="w-full" label=" Button Text">
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.buttonText"
                      )}
                      className="placeholder:text-sm h-11 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.buttonUrl"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-web.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label=" Button Url"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.buttonUrl"
                      )}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              {/** second section ends */}

              <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
                <div className="flex flex-col items-start justify-start">
                  <p className="font-medium text-mobile sm:text-sm">
                    Show Social Link
                  </p>
                </div>
                <Switch
                  checked={showSocialLink}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "formSettings.endScreenSettings.socialLink",
                      checked
                    )
                  }
                  className=""
                />
              </div>
              {/** third section */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.x"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-x.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label=" X"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register("formSettings.endScreenSettings.x")}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />

              {/**linkedin */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.linkedIn"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-linkedin.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label="LinkedIn"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.linkedIn"
                      )}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />

              {/** instagram */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.instagram"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-insta.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label="Instagram"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.instagram"
                      )}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              {/**facebook */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.facebook"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-fb.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label="Facebook"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.facebook"
                      )}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              {/** website */}

              <FormField
                control={form.control}
                name="formSettings.endScreenSettings.website"
                render={({ field }) => (
                  <InputOffsetLabel
                    append={
                      <Image
                        alt=""
                        className="h-full w-[40px]"
                        src="/end-web.svg"
                        width={100}
                        height={100}
                      />
                    }
                    className="w-full"
                    label="Website"
                  >
                    <Input
                      placeholder=""
                      type="text"
                      {...form.register(
                        "formSettings.endScreenSettings.website"
                      )}
                      className="placeholder:text-sm h-11 pl-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              {/** second section */}

              <Button className="self-center w-fit mt-8 gap-x-2  bg-basePrimary rounded-xl text-white ">
                {loading && <Loader2Icon size={20} className="animate-spin" />}
                Update
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export function EndScreenSettings({
  engagementForm,
}: {
  engagementForm: TEngagementFormQuestion;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const btnColor = useMemo(() => {
    if (engagementForm?.formSettings?.isPreMade) {
      return engagementForm?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#8841FD";
    } else return engagementForm?.formSettings?.buttonColor || "#001fcc";
  }, [engagementForm]);

  const textColor = useMemo(() => {
    if (engagementForm?.formSettings?.isPreMade) {
      return engagementForm?.formSettings?.preMadeType === "/brown-bg.jpg"
        ? "#6C4A4A"
        : "#190044";
    } else return engagementForm?.formSettings?.textColor || "#000000";
  }, [engagementForm]);

  const bgColor = useMemo(() => {
    if (engagementForm?.formSettings?.isPreMade) {
      return engagementForm?.formSettings?.preMadeType;
    } else if (engagementForm?.formSettings?.isBackgroundImage) {
      return engagementForm?.formSettings?.backgroundImage;
    } else return engagementForm?.formSettings?.backgroundColor || "#ffffff";
  }, [engagementForm]);

  const socials = useMemo(() => {
    const formSetting = engagementForm?.formSettings;
    return [
      {
        image: "/end-u-x.svg",
        url: formSetting?.endScreenSettings?.x || "https://zikoro.com",
      },
      {
        image: "/end-u-fb.svg",
        url: formSetting?.endScreenSettings?.facebook || "https://zikoro.com",
      },
      {
        image: "/end-u-in.svg",
        url: formSetting?.endScreenSettings?.linkedIn || "https://zikoro.com",
      },
    ];
  }, [engagementForm]);

  const showLinks = useMemo(() => {
    return engagementForm?.formSettings?.endScreenSettings
      ? engagementForm?.formSettings?.endScreenSettings?.socialLink
      : true;
  }, [engagementForm]);

  const showButton = useMemo(() => {
    return engagementForm?.formSettings?.endScreenSettings
      ? engagementForm?.formSettings?.endScreenSettings?.showButton
      : true;
  }, [engagementForm]);
  return (
    <>
      <div
        style={{
          backgroundColor: bgColor,
          backgroundImage: engagementForm?.formSettings?.isPreMade
            ? `url('${engagementForm?.formSettings?.preMadeType}')`
            : engagementForm?.formSettings?.isBackgroundImage
            ? `url('${engagementForm?.formSettings?.backgroundImage}')`
            : "",
          filter: engagementForm?.formSettings?.isBackgroundImage
            ? `brightness(${engagementForm?.formSettings?.backgroundBrightness})`
            : "",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: textColor,
        }}
        className="w-full h-screen text-sm flex-col flex items-center justify-center gap-4 relative"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="absolute rounded-xl bg-basePrimary z-10 text-white gap-x-2 h-10 right-2 top-2"
        >
          <InlineIcon icon="line-md:edit" fontSize={20} color="#fff" />
          <p>Edit End Screen</p>
        </Button>

        <h2 className="text-xl font-semibold">
          {engagementForm?.formSettings?.endScreenSettings?.title ??
            "Thanks for completing the form"}
        </h2>

        {showLinks && (
          <div className="flex items-center gap-x-3 justify-center mx-auto">
            {socials?.map((item) => (
              <button onClick={() => window.open(item?.url)}>
                <Image
                  src={item?.image}
                  alt=""
                  className="w-[40px] h-[40px]"
                  width={100}
                  height={100}
                />
              </button>
            ))}
          </div>
        )}

        <p>
          {engagementForm?.formSettings?.endScreenSettings?.subText ??
            "This is all for now"}
        </p>
        {showButton && (
          <Button
            style={{
              backgroundColor: btnColor,
            }}
            className="font-medium text-white rounded-xl"
          >
            {engagementForm?.formSettings?.endScreenSettings?.buttonText ??
              "Create your form"}
          </Button>
        )}
      </div>

      {isOpen && (
        <FieldSettings
          engagementForm={engagementForm}
          close={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
