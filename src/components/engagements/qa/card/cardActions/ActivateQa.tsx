"use client";

import { Switch } from "@/components/ui/switch";

import { usePostRequest } from "@/hooks/services/requests";
import { TOrganizationQa, TQa } from "@/types/qa";

export function ActivateQA({
  qa,
  refetch,
}: {
  refetch: () => Promise<any>;
  qa: TOrganizationQa;
}) {
  const { postData, isLoading } = usePostRequest("engagements/qa");
  async function updateStatus() {
    const { organization, ...restData} = qa
    const payload: Partial<TQa> = {
      ...restData,
      accessibility: {
        ...qa?.accessibility,
        disable: !qa.accessibility?.disable,
      },
    };

    await postData({ payload });
    refetch();
  }
  return (
    <>
      <div className="w-full px-4 text-xs flex items-center justify-between ">
        <p>Disabled</p>
        <Switch
          onClick={updateStatus}
          checked={qa.accessibility?.disable}
          disabled={isLoading}
          className="data-[state=unchecked]:bg-gray-200 data-[state=checked]:bg-basePrimary"
        />
      </div>
    </>
  );
}
