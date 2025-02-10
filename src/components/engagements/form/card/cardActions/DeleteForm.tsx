"use client";

import { Button } from "@/components/custom";
import { useState } from "react";

import { ActionModal } from "@/components/custom/ActionModal";
import { useDeleteRequest } from "@/hooks/services/requests";
export function DeleteForm({
  formAlias,
  refetch,
}: {
  refetch: () => Promise<any>;
  formAlias: string;
}) {
  const { deleteData, isLoading } = useDeleteRequest(
    `/engagements/form/${formAlias}/delete`
  );
  const [isOpen, setOpen] = useState(false);

  function onClose() {
    setOpen((prev) => !prev);
  }
  async function deletes() {
    await deleteData();
    refetch();
    onClose();
  }

  return (
    <>
      <Button
        onClick={() => {
          onClose();
        }}
        className="items-center h-10 w-full text-red-600 hover:bg-gray-100 justify-start text-xs"
      >
        Delete
      </Button>
      {isOpen && (
        <ActionModal
          close={onClose}
          loading={isLoading}
          asynAction={deletes}
          buttonText="Delete"
          title="Form"
          modalText="Delete Form"
          buttonColor="text-white bg-red-500"
        />
      )}
    </>
  );
}
