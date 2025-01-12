"use client";

import { Switch } from "@/components/ui/switch";
import { TQuestion, TQuiz } from "@/types/quiz";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/custom";
import { TOrganization } from "@/types/home";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { usePostRequest } from "@/hooks/services/requests";
import { InlineIcon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/utils";

function AddMusic({
  music,
  musicList,
  removeMusic,
  addMusic,
  selectMusic,
}: {
  removeMusic: (i: number) => void;
  music: { label: string; value: string } | null;
  musicList: { label: string; value: string }[] | null;
  addMusic: (t: { label: string; value: string }) => void;
  selectMusic: (t: { label: string; value: string }) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // if (!file.type.match("audio/(mp3|wav)")) {
    //   alert("Please upload only mp3 or wav files");
    //   return;
    // }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const musicObject = {
        label: file.name,
        value: base64String,
      };
      console.log(file.name);
      addMusic(musicObject);
    };
    reader.readAsDataURL(file);
  };

  function playMusic(value: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;

      if (currentlyPlaying === value) {
        setCurrentlyPlaying(null);
        return;
      }
    }

    const audio = new Audio(value);
    audioRef.current = audio;
    audio.play();
    setCurrentlyPlaying(value);

    audio.onended = () => {
      setCurrentlyPlaying(null);
    };
  }

  return (
    <div className="max-w-sm w-full mx-auto ">
      <button
        onClick={() => setOpen(true)}
        className="w-full h-11 relative rounded-lg "
      >
        <div className="w-full px-4 flex items-center bg-basePrimary-100 rounded-lg justify-between h-full">
          <p>{music?.label ?? "Select Music"}</p>
          <InlineIcon icon="iconoir:nav-arrow-down" fontSize={18} />
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={cn("w-full absolute hidden inset-x-0 ", isOpen && "block")}
        >
          <div
            onClick={() => setOpen(false)}
            className="w-full h-full z-[999999]  fixed inset-0"
          ></div>
          <div className="w-full h-fit relative pt-3 shadow z-[999999999] bg-white">
            <div className="flex flex-col items-start justify-start w-full">
              {Array.isArray(musicList) &&
                musicList?.map((m, index) => (
                  <div
                    onClick={() => selectMusic(m)}
                    className={cn(
                      "w-full px-3 py-2 border-b flex items-center justify-between",
                      music?.value === m?.value && "bg-basePrimary-100"
                    )}
                  >
                    <p className="max-w-[200px] line-clamp-1">{m.label}</p>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playMusic(m.value);
                        }}
                      >
                        <InlineIcon
                          fontSize={18}
                          icon={
                            currentlyPlaying === m.value
                              ? "solar:pause-circle-bold-duotone"
                              : "solar:play-circle-bold-duotone"
                          }
                          color="#001fcc"
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentlyPlaying === m.value) {
                            audioRef.current?.pause();
                            setCurrentlyPlaying(null);
                          }
                          removeMusic(index);
                        }}
                      >
                        <InlineIcon
                          fontSize={18}
                          icon="ic:twotone-delete"
                          color="#ef4444"
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <div className="w-full bg-basePrimary-100 p-3 flex flex-col items-center justify-center">
              {(musicList === null ||
                (Array.isArray(musicList) && musicList?.length < 2)) && (
                <>
                  <label
                    htmlFor="m-upload"
                    className="flex relative items-center gap-x-2"
                  >
                    <input
                      onChange={handleAudioUpload}
                      type="file"
                      id="m-upload"
                      accept=".mp3,.wav"
                      className="w-full h-full inset-0 absolute z-20"
                      hidden
                    />
                    <InlineIcon
                      icon="ant-design:plus-circle-twotone"
                      color="#001fcc"
                      fontSize={16}
                    />
                    <p>Upload your music</p>
                  </label>
                  <p className="text-mobile">Supported format mp3 wav</p>
                </>
              )}
              {Array.isArray(musicList) && musicList.length === 2 && (
                <p className="text-center">
                  You can upload a maximum of two files. To add more, please
                  delete one of the previously uploaded file
                </p>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export function QuizAccessibility({
  quiz,
  refetch,
  organization,
}: {
  quiz: TQuiz<TQuestion[]>;
  refetch: () => Promise<any>;
  organization: TOrganization;
}) {
  const [loading, setLoading] = useState(false);
  const { postData, isLoading } =
    usePostRequest<Partial<TQuiz<TQuestion[]>>>("engagements/quiz");
  const [accessibility, setAccessibility] = useState({
    visible: false,
    review: false,
    countdown: true,
    timer: true,
    countdownTransition: true,
    countDown: 5,
    disable: false,
    playMusic: false,
    musicList: quiz?.accessibility ? quiz?.accessibility?.musicList : null,
    music: quiz?.accessibility ? quiz?.accessibility?.music : null,
    live: false,
    isCollectPhone: false,
    isCollectEmail: false,
    isForm: false,
    showAnswer: quiz.interactionType === "quiz" ? true : false,
    showResult: quiz.interactionType === "quiz" ? true : false,
  });
  const isQuiz = useMemo(() => {
    return quiz.interactionType === "quiz";
  }, [quiz]);

  useEffect(() => {
    if (quiz && quiz?.accessibility !== null) {
      setAccessibility(quiz?.accessibility);
    }
  }, [quiz]);

  async function onSubmit() {
    setLoading(true);

    let mList: { label: string; value: string }[] | null = [];
    if (Array.isArray(accessibility?.musicList)) {
      mList = await Promise.all(
        accessibility?.musicList?.map(async (msc) => {
          if (msc.value.startsWith("https://")) {
            return msc;
          } else {
            const url = await uploadFile(msc.value, "pdf");
            return {
              ...msc,
              value: url,
            };
          }
        })
      );
    } else {
      mList = null;
    }
    let addedMusic: { label: string; value: string } | null;
    if (accessibility?.music !== null) {
      addedMusic = await new Promise(async (resolve) => {
        if (accessibility?.music?.value?.startsWith("https")) {
          resolve(accessibility?.music);
        } else {
          const url = await uploadFile(accessibility?.music?.value!, "pdf");
          resolve({ value: url, label: accessibility?.music?.label! });
        }
      });
    } else {
      addedMusic = null;
    }
    const payload: Partial<TQuiz<TQuestion[]>> = {
      ...quiz,
      accessibility: { ...accessibility, musicList: mList, music: addedMusic },
    };

    await postData({ payload });
    setLoading(false);
    refetch();
  }

  function removePresentationMusic(i: number) {
    const filtered = accessibility?.musicList?.filter(
      (_, index) => index !== i
    );
    //
    setAccessibility({ ...accessibility, musicList: filtered! });
    const msc = accessibility?.musicList?.find((m, index) => index === i);
    if (
      msc &&
      accessibility?.music &&
      msc?.value === accessibility?.music?.value
    ) {
      setAccessibility({ ...accessibility, music: null });
    }
  }

  function addPresentationMusic({
    value,
    label,
  }: {
    label: string;
    value: string;
  }) {
    let mArray =
      accessibility.musicList !== null ? [...accessibility.musicList] : [];

    mArray.push({ value, label });
    setAccessibility({ ...accessibility, musicList: mArray });
  }
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Make{isQuiz ? " Quiz " : " Poll "}Visible to Everyone?</p>
          <p className="text-xs text-gray-500">
            Users who are not registered for your event can access your
            {isQuiz ? "quiz" : "poll"}
          </p>
        </div>
        <Switch
          disabled={loading}
          checked={accessibility?.visible}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              visible: !accessibility.visible,
            })
          }
          className=""
        />
      </div>

      {accessibility?.visible && (
        <>
          <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <p>Collect player's Email</p>
            </div>
            <Switch
              disabled={loading}
              checked={accessibility?.isCollectEmail}
              onClick={() =>
                setAccessibility({
                  ...accessibility,
                  isCollectEmail: !accessibility.isCollectEmail,
                  isCollectPhone: false,
                })
              }
              className=""
            />
          </div>
          <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <p>Collect player's Phone Number</p>
            </div>
            <Switch
              disabled={loading}
              checked={accessibility?.isCollectPhone}
              onClick={() =>
                setAccessibility({
                  ...accessibility,
                  isCollectPhone: !accessibility.isCollectPhone,
                  isCollectEmail: false,
                })
              }
              className=""
            />
          </div>
        </>
      )}

      {isQuiz && (
        <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <p>Review answers after each question</p>
            <p className="text-xs text-gray-500">
              You will see how people answered each question before the next
              question appears.
            </p>
          </div>
          <Switch
            disabled={loading}
            checked={accessibility?.review}
            onClick={() =>
              setAccessibility({
                ...accessibility,
                review: !accessibility.review,
              })
            }
            className=""
          />
        </div>
      )}
      {isQuiz && (
        <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
          <p>Question Answer Visibility</p>

          <Switch
            disabled={loading}
            checked={accessibility?.showAnswer}
            onClick={() =>
              setAccessibility({
                ...accessibility,
                showAnswer: !accessibility.showAnswer,
              })
            }
            className=""
          />
        </div>
      )}
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Show {isQuiz ? "Quiz" : "Poll"} Result</p>
          <p className="text-xs text-gray-500">
            Participants will see the score sheet immediately after the{" "}
            {isQuiz ? "quiz" : "poll"}.
          </p>
        </div>
        <Switch
          disabled={loading}
          checked={accessibility?.showResult}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              showResult: !accessibility.showResult,
            })
          }
          className=""
        />
      </div>

      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <p>Show countdown before the next question</p>

        <Switch
          disabled={loading}
          checked={accessibility?.countdown}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              countdown: !accessibility.countdown,
            })
          }
          className=""
        />
      </div>

      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Show timer</p>
          <p className="text-xs text-gray-500">
            The timer shown while attempting the quiz will be turned off.
          </p>
        </div>
        <Switch
          disabled={loading}
          checked={accessibility?.timer}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              timer: !accessibility.timer,
            })
          }
          className=""
        />
      </div>
      <div className="flex flex-col w-full items-center justify-center gap-5">
        <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <p>Show countdown transition</p>
            <p className="text-xs text-gray-500">
              Countdown appears before each new question.
            </p>
          </div>
          <Switch
            disabled={loading}
            checked={accessibility.countdownTransition}
            onClick={() =>
              setAccessibility({
                ...accessibility,
                countdownTransition: !accessibility.countdownTransition,
              })
            }
            className=""
          />
        </div>
        <div
          className={cn(
            "h-12 rounded-lg bg-basePrimary-200 hidden items-center gap-x-3 justify-center w-fit px-3",
            accessibility.countdownTransition && "flex"
          )}
        >
          <button
            disabled={accessibility.countDown === 1}
            onClick={() => {
              setAccessibility({
                ...accessibility,
                countDown: accessibility.countDown - 1,
              });
            }}
          >
            <InlineIcon
              icon="ant-design:minus-circle-twotone"
              color="#001fcc"
              fontSize={18}
            />
          </button>
          <p>
            {" "}
            <span className="text-base sm:text-xl underline">
              {accessibility?.countDown}
            </span>{" "}
            Sec
          </p>
          <button
            onClick={() => {
              setAccessibility({
                ...accessibility,
                countDown: accessibility.countDown + 1,
              });
            }}
          >
            <InlineIcon
              icon="line-md:plus-circle-twotone"
              color="#001fcc"
              fontSize={18}
            />
          </button>
        </div>
      </div>

      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Disable {isQuiz ? "quiz" : "poll"}</p>
          <p className="text-xs text-gray-500">
            Participants will no longer be able to join this{" "}
            {isQuiz ? "quiz" : "poll"}.
          </p>
        </div>
        <Switch
          disabled={loading}
          checked={accessibility.disable}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              disable: !accessibility.disable,
            })
          }
          className=""
        />
      </div>
      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start justify-start">
          <p>Live Mode</p>
          <p className="text-xs text-gray-500">
            {organization && organization?.subscriptionPlan === "Free"
              ? `Upgrade to higher subscription to use this feature.`
              : `All ${
                  isQuiz ? `quiz` : `poll`
                } participants will attempt the ${
                  isQuiz ? `quiz` : `poll`
                } at the same time.`}
          </p>
        </div>
        {/***={loading} */}
        <Switch
          disabled={organization && organization?.subscriptionPlan === "Free"}
          checked={accessibility.live}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              live: !accessibility.live,
            })
          }
          className=""
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-5">
        <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <p>Play Music in Presentation Mode</p>
          </div>
          <Switch
            disabled={loading}
            checked={accessibility?.playMusic}
            onClick={() =>
              setAccessibility({
                ...accessibility,
                playMusic: !accessibility.playMusic,
              })
            }
            className=""
          />
        </div>

        {accessibility?.playMusic && (
          <AddMusic
            selectMusic={(item) =>
              setAccessibility({ ...accessibility, music: item })
            }
            addMusic={addPresentationMusic}
            removeMusic={removePresentationMusic}
            music={accessibility?.music}
            musicList={accessibility?.musicList}
          />
        )}
      </div>

      <div className="flex w-full text-mobile sm:text-sm items-center justify-between">
        <div className="flex flex-col items-start  justify-start">
          <p>Form</p>
          <p className="text-xs text-gray-500">
            Create a custom forms to collect your defined user data before they
            can participate.
          </p>
          {accessibility?.isForm && (
            <div className="flex mt-1 items-start flex-col gap-3">
              {/* {selectedForm && (
                      <div className="w-[250px] h-[250px]">
                        <div className="w-full border p-3 rounded-lg grid grid-cols-10 gap-x-3 bg-white border-basePrimary">
                          {selectedForm?.coverImage &&
                          (selectedForm?.coverImage as string).startsWith(
                            "https"
                          ) ? (
                            <Image
                              alt=""
                              src={selectedForm?.coverImage}
                              width={500}
                              height={500}
                              className="w-full col-span-3 h-[100px] rounded-lg object-cover"
                            />
                          ) : (
                            <div className="col-span-3 h-[100px] rounded-lg bg-gray-200 animate-pulse"></div>
                          )}
                          <div className="w-full col-span-7 flex items-start justify-start flex-col gap-2">
                            <h2 className="font-medium text-base sm:text-lg">
                              {selectedForm?.title ?? ""}
                            </h2>
                            <p className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                              {selectedForm?.description ?? ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )} */}
              {/* <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleSelectFormModal();
                      }}
                      className="text-basePrimary px-0  h-fit w-fit underline"
                    >
                      Select/Create a Form
                    </Button> */}
            </div>
          )}
        </div>
        <Switch
          disabled={loading}
          checked={accessibility?.isForm}
          onClick={() =>
            setAccessibility({
              ...accessibility,
              isForm: !accessibility.isForm,
            })
          }
          className=""
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className="text-white h-11 gap-x-2 font-medium bg-basePrimary w-full max-w-xs mt-4"
      >
        {loading && <LoaderAlt size={20} className="animate-spin" />}
        <p>Update</p>
      </Button>
    </div>
  );
}
