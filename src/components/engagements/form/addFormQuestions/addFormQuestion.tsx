"use client"

import { useGetData ,usePostRequest} from "@/hooks/services/requests";
import { TEngagementFormQuestion } from "@/types/form";
import { TOrganization } from "@/types/home";
import { useRouter } from "next/router";

export default function AddFormQuestions({
    quizId,
    workspaceAlias,
  }: {
    quizId: string;
    workspaceAlias: string;
  }) {
    const router = useRouter();
    const { data, isLoading, getData } = useGetData<TEngagementFormQuestion>(
      `engagements/form/${quizId}`
    );
    const { data: organization } = useGetData<TOrganization>(
      `organization/${workspaceAlias}`
    );
    const { postData } = usePostRequest<TEngagementFormQuestion>("engagements/form");
    return (
        <>
        
        <div className="w-screen min-h-screen fixed z-10 inset-0 sm:px-4  mx-auto">
        <div className="w-full h-full gap-4 sm:pt-4 items-start grid grid-cols-12">
           
           
            </div>
        </div>
        </>
    )
}