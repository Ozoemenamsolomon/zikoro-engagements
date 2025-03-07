"use client";

import useUserStore from "@/store/globalUserStore";
import { TAttendee, TEvent, TOrganization } from "@/types/home";
import { useState, useEffect } from "react";
import { useGetData } from "./requests";
import { TOrganizationQa } from "@/types/qa";
import { TOrganizationQuiz } from "@/types/quiz";
import { createClient } from "@/utils/supabase/client";
import { useGetQas } from "./qa";
import { useGetQuizzes } from "./quiz";
import { usegetForm } from "./forms";
import { TOrganizationForm } from "@/types/form";
import { getRequest } from "@/utils/api";

const supabase = createClient();

export function useGetOrganizationEvents() {
  const [events, setEvents] = useState<TEvent[]>([]);
  const [loading, setLoading] = useState(false);

  async function getEvents(orgId: string) {
    try {
      setLoading(true);
      const { data: responseData, status } = await getRequest<TEvent[]>({
        endpoint: `organization/${orgId}/event`,
      });

      if (status !== 200) {
        throw new Error("Failed to fetch data");
      }

      setEvents(responseData.data);
     

      return responseData.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    events,
    getEvents,
    loading
  };
}

export function useVerifyAttendee() {
  const [attendee, setAttendee] =useState<TAttendee | null>(null)
  const [loading, setLoading] = useState(false);

  async function getAttendee(orgId: string, alias:string) {
    try {
      setLoading(true);
      const { data: responseData, status } = await getRequest<TAttendee>({
        endpoint: `organization/${orgId}/event/attendee/${alias}`,
      });

      if (status !== 200) {
        throw new Error("Failed to fetch data");
      }

      setAttendee(responseData.data);
     

      return responseData.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    attendee,
    getAttendee,
    loading
  };
}

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
    getOrganizations();
  }, [userData]);
  //return data
  return {
    organizations: userOrganizations,
    getOrganizations,
    loading: orgLoading,
  };
}

export function useGetUserEngagements() {
  const [qas, setQas] = useState<TOrganizationQa[]>([]);
  const [forms, setForms] = useState<TOrganizationForm[]>([]);
  const [quizzes, setQuizzes] = useState<TOrganizationQuiz[]>([]);
  const { qas: data, isLoading: qaLoading, getQas: getQas } = useGetQas();
  const {
    quizzes: dataquizzes,
    isLoading: quizLoading,
    getQuizzes: getQuizzes,
  } = useGetQuizzes();

  const { forms: dataForms, isLoading: formLoading, getForm } = usegetForm();

  useEffect(() => {
    if (!qaLoading && !quizLoading) {
      setQas(data);
      setQuizzes(dataquizzes);
      setForms(dataForms);
    }
  }, [qaLoading, data, quizLoading, dataquizzes, dataForms, formLoading]);

  return {
    qas,
    quizzes,
    forms,
    formLoading,
    qaLoading,
    quizLoading,
    getQuizzes,
    getQas,
    getForm,
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
