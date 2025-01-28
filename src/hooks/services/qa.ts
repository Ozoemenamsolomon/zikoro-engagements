import { getRequest } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { TOrganizationQa, TQAQuestion } from "@/types/qa";
import useUserStore from "@/store/globalUserStore";

const supabase = createClient();

export const useGetQAQuestions = ({ qaId }: { qaId: string }) => {
  const [eventQAQuestions, setEventQAQuestions] = useState<
    TQAQuestion[] | null
  >(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const getQAQUestions = async () => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TQAQuestion[]>({
        endpoint: `engagements/qa/${qaId}/questions`,
      });

      if (status !== 200) {
        throw data;
      }
      setEventQAQuestions(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQAQUestions();
  }, [qaId]);

  const fetchQAQuestion = (updateQuestion: TQAQuestion[]) => {
    setEventQAQuestions(updateQuestion);
  };

  return {
    eventQAQuestions,
    isLoading,
    getQAQUestions,
    setEventQAQuestions: fetchQAQuestion,
  };
};

export const useQARealtimePresence = (isLive: boolean) => {
  useEffect(() => {
    // console.log("real presence")
    if (!isLive) return;
    const channel = supabase.channel("live-quiz");

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        console.log("sync", newState);
        for (let id in newState) {
          //  console.log(newState[id][0])
        }
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
        // saveCookie("player", {
        //   userId: newPresences[0]?.presence_ref,
        //   connectedAt: newPresences[0]?.online_at,
        // });
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
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
  }, [supabase]);
};

export const useGetQas = () => {
  const [qas, setQas] = useState<TOrganizationQa[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useUserStore();

  const getQas = async () => {
    try {
      setLoading(true);
      const { data, status } = await getRequest<TOrganizationQa[]>({
        endpoint: `engagements/qa/team/${user?.id}`,
      });

      if (status !== 200) {
        throw data;
      }
      setQas(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQas();
  }, [user]);

  return { qas, isLoading, getQas };
};
