"use client";

import { ArrowLeftIcon, engagementHomeLinks } from "@/constants";
import Image from "next/image";
import { ScrollableCards } from "../custom/ScrollableCards";
import useUserStore from "@/store/globalUserStore";
import { useState } from "react";
import { CreateEngagement } from "./_components/CreateEngagement";
import { useGetUserEngagements } from "@/hooks/services/engagement";
import { TOrganizationQa, TQa } from "@/types/qa";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { cn } from "@/lib/utils";
import { TOrganizationQuiz } from "@/types/quiz";
import { QuizCard } from "../engagements/quiz/card/QuizCard";
import { QaCard } from "../engagements/qa/card/QaCard";

export default function Dashboard() {
  const { user } = useUserStore();
  const [isOpen, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { qas, loading, quizzes, getQas, getQuizzes } = useGetUserEngagements();

  function onClose() {
    setOpen((prev) => !prev);
  }
  function showModal(type: number) {
    setOpen(true);
    setCurrentIndex(type);
  }
  return (
    <div className="w-full mt-8 sm:mt-10 ">
      <div className="flex flex-col items-start gap-y-2 mb-4 sm:mb-6 justify-start">
        <p className="text-sm sm:text-desktop">
          Hello{" "}
          <span className="font-medium text-base sm:text-xl capitalize">
            {user?.firstName ?? ""}
          </span>
        </p>
        <p>What engagement feature will you be using today?</p>
      </div>
      <div className="w-full py-4  mb-4 sm:mb-6 ">
        <ScrollableCards>
          {engagementHomeLinks.map((nav, index) => (
            <ActionCard
              key={index}
              index={index}
              Icon={nav.Icon}
              name={nav.name}
              href={nav.link}
              showCreate={showModal}
              currentIndex={currentIndex}
            />
          ))}
        </ScrollableCards>
      </div>

      <div className="w-full  bg-basePrimary-100 p-4 rounded-lg">
        <h2 className="font-medium mb-3 sm:mb-6">Engagements</h2>
        {loading && (
          <div className="w-full h-[200px] flex items-center justify-center">
            <LoaderAlt className="animate-spin" size={30} />
          </div>
        )}
        {qas?.length === 0 && (
          <div className="w-full h-[200px] flex items-center justify-center">
            <h2 className="font-medium text-lg">No Data</h2>
          </div>
        )}
        <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.isArray(quizzes) &&
            quizzes.map((quiz, index) => (
              <QuizCard refetch={getQuizzes} key={index} quiz={quiz}  />
            ))}
          {Array.isArray(qas) &&
            qas.map((qa, index) => (
              <QaCard key={index} qa={qa} refetch={getQas}  />
            ))}
        </div>
      </div>
      {isOpen && <CreateEngagement close={onClose} type={currentIndex} />}
    </div>
  );
}

function ActionCard({
  Icon,
  name,
  index,
  showCreate,
  currentIndex,
}: {
  Icon: React.ElementType;
  name: string;
  href: string;
  index: number;
  showCreate: (t: number) => void;
  currentIndex: number;
}) {
  return (
    <button
      onClick={() => showCreate(index)}
      className={cn(
        "w-[100px] h-[100px] rounded-lg p-4 bg-white sm:w-[200px] relative sm:h-[200px] gap-3 flex flex-col items-center justify-center",
        currentIndex === index && "border border-basePrimary"
      )}
    >
      <Icon />
      <p>{name}</p>
      <div className="w-4 sm:w-10 h-4 sm:h-10 rounded-full flex absolute items-center border justify-center bottom-3 right-4">
        <ArrowLeftIcon />
      </div>
    </button>
  );
}

function HomeEngagementCard({
  data,
  type,
}: {
  data: TOrganizationQa | TOrganizationQuiz;
  type: string;
}) {
  return (
    <div
      onClick={() => {
        if (type === "qa") {
          window.open(
            `/e/${data?.workspaceAlias}/qa/o/${
              (data as TOrganizationQa)?.QandAAlias
            }`,
            "_self"
          );
        } else {
          window.open(
            `/e/${data?.workspaceAlias}/quiz/o/${
              (data as TOrganizationQuiz)?.quizAlias
            }/add-question`,
            "_self"
          );
        }
      }}
      className="w-full rounded-lg gap-3 text-sm border border-basePrimary-100 p-3 grid grid-cols-7"
    >
      {data?.coverImage && data?.coverImage?.startsWith("https") ? (
        <Image
          src={data?.coverImage}
          alt="engagement"
          className="w-full h-[100px] sm:h-[150px] object-cover xl:h-[180px] rounded-lg col-span-2"
          width={300}
          height={400}
        />
      ) : (
        <div className="bg-basePrimary-100 w-full h-[100px] sm:h-[150px] xl:h-[180px] r rounded-lg col-span-2"></div>
      )}
      <div className="w-full col-span-5 flex items-start justify-between">
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <p className="font-semibold text-desktop sm:text-lg">
            {data?.coverTitle ?? ""}
          </p>
          <p className="w-full text-gray-500 line-clamp-3 ">
            {data?.description ?? ""}
          </p>
        </div>
        <p className="border border-basePrimary rounded-3xl h-8 flex items-center justify-center px-3 bg-basePrimary gradient-text">
          {type === "qa" ? "Q&A" : "Quiz"}
        </p>
      </div>
    </div>
  );
}
