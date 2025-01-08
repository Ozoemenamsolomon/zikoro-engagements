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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const organizationAlias = organizations.map(
        ({ organizationAlias }) => organizationAlias
      );

      // // getting events that matches those organization ids
      // const matchingEvents = events?.filter((event) => {
      //   return organizationIds.includes(Number(event?.organisationId));
      // });
    }
  }, [isLoading, organizations]);
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
