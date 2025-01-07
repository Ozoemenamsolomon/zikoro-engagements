"use client"

import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/home";
import { useState, useEffect } from "react";
import { useGetData } from "./requests";

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
    }, [organizations]);
  
    //return data
    return {
      organizations: userOrganizations,
      getOrganizations,
    };
  }