"use client";

import { Button } from "@/components/custom";
import { TOrganizationQa, TQa } from "@/types/qa";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { usePostRequest } from "@/hooks/services/requests";
import { generateAlias } from "@/utils";
export function CopyQA({
  qa,
  refetch,
}: {
  qa: TOrganizationQa;
  refetch: () => Promise<any>;
}) {
    const { postData, isLoading } = usePostRequest("engagements/qa");

  async function coppied() {
    const {id, organization, ...restData} = qa
    const newAlias = generateAlias();

    const payload = {
      ...restData,
      QandAAlias: newAlias,
    };

    await postData({ payload });
    refetch();
  }
  return (
    <>
      <Button
      disabled={isLoading}
        onClick={coppied}
        className={
          "items-center h-10 gap-x-2 hover:bg-gray-100 justify-start w-full  text-xs"
        }
      >
        {isLoading && <LoaderAlt size={12} className="animate-spin" />}
        <span>Make a Copy</span>
      </Button>
    </>
  );
}
