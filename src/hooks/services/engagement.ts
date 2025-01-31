"use client";

import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";
import { useState, useEffect, useMemo } from "react";
import { useGetData } from "./requests";
import { TOrganizationQa, TQa } from "@/types/qa";
import { TOrganizationQuiz } from "@/types/quiz";
import { createClient } from "@/utils/supabase/client";
import { useGetQas } from "./qa";
import { useGetQuizzes } from "./quiz";

const supabase = createClient();

export function useGetUserOrganizations() {
  // const userData = getCookie("user");
  const { user: userData, setUser } = useUserStore();
  const [orgLoading, setOrgLoading] = useState(false);
  const [userOrganizations, setUserOrganizatiions] = useState<TOrganization[]>(
    [] as TOrganization[]
  );
  async function getOrganizations() {
    try {
      setOrgLoading(true);
      const { data, error } = await supabase
        .from("organizationTeamMembers_Engagement")
        .select("*, organization(*)")
        .eq("userId", userData?.id);

      if (error) {
        throw error.message;
      }

      if (Array.isArray(data) && data.length > 0) {
        const result: TOrganization[] = data?.map((datum) => {
          const { organization, created_at, ...restData } = datum;
          return {
            ...organization,
            teamMembers: {
              ...restData,
            },
          };
        });

        setUserOrganizatiions(result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOrgLoading(false);
    }
  }

  useEffect(() => {
    getOrganizations()
  },[userData])
  //return data
  return {
    organizations: userOrganizations,
    getOrganizations,
    loading: orgLoading,
  };
}

export function useGetUserEngagements() {
  const [qas, setQas] = useState<TOrganizationQa[]>([]);
  const [quizzes, setQuizzes] = useState<TOrganizationQuiz[]>([]);
  const {
    qas: data,
    isLoading: qaLoading,
    getQas: getQas,
  } = useGetQas();
  const {
    quizzes: dataquizzes,
    isLoading: quizLoading,
    getQuizzes: getQuizzes,
  } = useGetQuizzes();


  useEffect(() => {
    if (!qaLoading && !quizLoading) {
     
      setQas(data);
      setQuizzes(dataquizzes);
    }
  }, [qaLoading, data, quizLoading, dataquizzes]);

  return {
    qas,
    quizzes,
     qaLoading, quizLoading,
    getQuizzes,
    getQas,
  };
}

export function useVerifyUserAccess(workspaceAlias: string) {
  const { user } = useUserStore();
  const [isHaveAccess, setIsHaveAccess] = useState(false);
  const { data, isLoading } = useGetData<TOrganization>(
    `organization/${workspaceAlias}`
  );

  useEffect(() => {
    if (!isLoading && data !== null) {
      const isAccess = data.teamMembers?.some(
        ({ userEmail }) => userEmail === user?.userEmail
      );
      setIsHaveAccess(isAccess);
    }
  }, [isLoading, data, user]);

  return {
    isLoading,

    isHaveAccess,
  };
}
