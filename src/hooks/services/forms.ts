"use client"

import { useEffect, useState } from "react";
import useUserStore from "@/store/globalUserStore";
import { toast } from "react-toastify";
import { getRequest } from "@/utils/api";
import { TOrganizationForm } from "@/types/form";


export const usegetForm = () => {
    const [forms, setForms] = useState<TOrganizationForm[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { user } = useUserStore();
  
    const getForm = async () => {
      try {
        setLoading(true);
        const { data, status } = await getRequest<TOrganizationForm[]>({
          endpoint: `engagements/form/team/${user?.id}`,
        });
  
        if (status !== 200) {
          throw data;
        }
        setForms(data.data);
      } catch (error: any) {
     //   toast.error(error?.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      getForm();
    }, [user]);
  
    return { forms, isLoading, getForm };
  };