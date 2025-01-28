"use client";

import useUserStore from "@/store/globalUserStore";
import { TQAQuestion } from "@/types/qa";
import { TAnswer, TLiveQuizParticipant, TOrganizationQuiz, TQuestion, TQuiz } from "@/types/quiz";
import { getRequest } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const supabase = createClient();
export const useRealtimePresence = (isLive: boolean) => {
  useEffect(() => {
    if (isLive) {
      const channel = supabase.channel("live-quiz");

      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          // console.log("sync", newState);
          for (let id in newState) {
            //  console.log(newState[id][0])
          }
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          // console.log("leave", key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, isLive]);

  useEffect(() => {
    if (isLive) {
      const channel = supabase.channel("live-players");

      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          // console.log("sync", newState);
          for (let id in newState) {
            //  console.log(newState[id][0])
          }
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          // console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          // console.log("leave", key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, isLive]);

  useEffect(() => {
    if (isLive) {
      const channel = supabase.channel("live-answer");

      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          // console.log("sync", newState);
          for (let id in newState) {
            //  console.log(newState[id][0])
          }
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          // console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          // console.log("leave", key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, isLive]);
};

export const useGetQuizAnswer = () => {
  const [answers, setAnswers] = useState<TAnswer[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  // console.log({date})
  const getAnswers = async (quizId: number) => {
    setLoading(true);

    const { data, status } = await getRequest<TAnswer[]>({
      endpoint: `engagements/quiz/answer/${quizId}`,
    });

    setLoading(false);

    if (status !== 200) return;

    //
    return setAnswers(data.data);
  };

  return { answers, isLoading, getAnswers, setAnswers };
};

export const useFetchQuiz = () => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const getQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TQuiz<TQAQuestion[]>>({
        endpoint: `/quiz/single/${quizId}`,
      });

      if (status !== 200) {
        throw data;
      }
      return data.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, getQuiz };
};

export const useGetLiveParticipant = ({ quizId }: { quizId: string }) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [liveQuizPlayers, setLiveQuizPlayers] = useState<
    TLiveQuizParticipant[]
  >([]);

  const getLiveParticipant = async () => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TLiveQuizParticipant[]>({
        endpoint: `engagements/quiz/participant/${quizId}`,
      });

      if (status !== 200) {
        throw data;
      }
      setLiveQuizPlayers(data.data);
    } catch (error: any) {
      //
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLiveParticipant();
  }, [quizId]);

  return { getLiveParticipant, liveQuizPlayers, isLoading, setLiveQuizPlayers };
};

export const useGetQuiz = ({ quizId }: { quizId: string }) => {
  const [quiz, setQuiz] = useState<TQuiz<TQuestion[]> | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const getQuiz = async () => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TQuiz<TQuestion[]>>({
        endpoint: `engagements/quiz/${quizId}`,
      });

      if (status !== 200) {
        throw data;
      }
      setQuiz(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuiz();
  }, [quizId]);

  const fetchQuiz = (updatedQuiz: TQuiz<TQuestion[]>) => {
    setQuiz(updatedQuiz);
  };

  return { quiz, isLoading, getQuiz, setQuiz: fetchQuiz };
};

export const useGetAnswer = () => {
  const [answer, setAnswer] = useState<TAnswer[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  // console.log({date})
  const getAnswer = async (questionId: string) => {
    setLoading(true);

    const { data, status } = await getRequest<TAnswer[]>({
      endpoint: `engagements/quiz/answer/single/${questionId}`,
    });

    setLoading(false);

    if (status !== 200) return;

    //
    return setAnswer(data.data);
  };

  /**
   useEffect(() => {
    getAnswer();
  }, [questionId]);
  */

  return { answer, isLoading, getAnswer };
};

export const useGetQuizzes = () => {
  const [quizzes, setQuizzes] = useState<TOrganizationQuiz[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useUserStore();

  const getQuizzes = async () => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TOrganizationQuiz[]>({
        endpoint: `engagements/quiz/team/${user?.id}`,
      });

      if (status !== 200) {
        throw data;
      }
      setQuizzes(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuizzes();
  }, [user]);

  return { quizzes, isLoading, getQuizzes };
};
