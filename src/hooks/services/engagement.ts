"use client";

import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";
import { useState, useEffect, useMemo } from "react";
import { useGetData } from "./requests";
import { TOrganizationQa, TQa } from "@/types/qa";
import { TOrganizationQuiz } from "@/types/quiz";

export function useGetUserOrganizations() {
  // const userData = getCookie("user");
  const { user: userData, setUser } = useUserStore();
  const [userOrganizations, setUserOrganizatiions] = useState<TOrganization[]>(
    [] as TOrganization[]
  );

  const {
    data: organizations,
    isLoading: orgLoading,
    getData: getOrganizations,
  } = useGetData<TOrganization[]>("organization");
  // checking if thwe user is a team member of some organizations
  useEffect(() => {
    if (!orgLoading && organizations) {
      const filteredOrganizations = organizations?.filter((organization) => {
        return organization.teamMembers?.some(
          ({ userEmail }) => userEmail === userData?.userEmail
        );
      });

      setUserOrganizatiions(filteredOrganizations);
    }
  }, [organizations, userData]);

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
  const { user: userData } = useUserStore();
  const { data, isLoading: qaLoading , getData: getQas} =
    useGetData<TOrganizationQa[]>("engagements/qa");
  const { data: dataquizzes, isLoading: quizLoading, getData: getQuizzes } =
    useGetData<TOrganizationQuiz[]>("engagements/quiz");


  useEffect(() => {
    if (!qaLoading && !quizLoading) {
  

      const matchingQas = data?.filter((qa) => {
        return qa?.organization && qa?.organization.teamMembers?.some(
          ({ userEmail }) => userEmail === userData?.userEmail
        );
      });
      const matchingQuizzes = dataquizzes?.filter((quiz) => {
        return quiz?.organization && quiz?.organization.teamMembers?.some(
          ({ userEmail }) => userEmail === userData?.userEmail
        );
      });
      setQas(matchingQas);
      setQuizzes(matchingQuizzes);
    }
  }, [qaLoading, data, quizLoading, dataquizzes]);
  //!qaLoading && !quizLoading

  return {
    qas,
    quizzes,
    loading: qaLoading || quizLoading,
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
