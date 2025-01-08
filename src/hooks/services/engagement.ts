"use client";

import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";
import { useState, useEffect, useMemo } from "react";
import { useGetData } from "./requests";
import { TQa } from "@/types/qa";

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
  const [qa, setQa] = useState<TQa[]>([]);
  const { organizations, loading: isLoading } = useGetUserOrganizations();
  const {data: qas, isLoading: qaLoading} = useGetData<TQa[]>("engagements/qa")
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !qaLoading) {
      setLoading(true)
      const organizationAlias = organizations.map(
        ({ organizationAlias }) => organizationAlias
      );

     
      const matchingQas = qas?.filter((qa) => {
        return organizationAlias.includes(qa?.workspaceAlis);
      });
      setQa(matchingQas)
      setLoading(false)
    }
  }, [isLoading, organizations]);


  return {
    qa,
    loading
  }
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
    isHaveAccess
  }
}
