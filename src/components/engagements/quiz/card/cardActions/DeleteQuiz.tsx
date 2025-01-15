"use client";

import { Button } from "@/components/custom";
import { useState } from "react";
import { ActionModal } from "@/components/custom/ActionModal";
import { useDeleteRequest } from "@/hooks/services/requests";
export function DeleteQuiz({
  quizAlias,
  refetch,
}: {
  refetch: () => Promise<any>;
  quizAlias: string;
}) {
  const { deleteData: deleteQuiz, isLoading } = useDeleteRequest(
    `engagements/quiz/${quizAlias}`
  );
  const [isOpen, setOpen] = useState(false);

  function onClose() {
    setOpen((prev) => !prev);
  }
  async function deletes() {
    await deleteQuiz();
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
          buttonColor="bg-red-600 text-white"
        />
      )}
    </>
  );
}
