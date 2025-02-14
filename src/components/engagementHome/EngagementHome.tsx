"use client";

import { useGetUserEngagements } from "@/hooks/services/engagement";
import { FormCard } from "../engagements/form/card/FormCard";
import { QuizCard } from "../engagements/quiz/card/QuizCard";
import { QaCard } from "../engagements/qa/card/QaCard";
import { EngagementEmptyState } from "../dashboard/Dashboard";
import { CreateOrganization } from "../createOrganization/CreateOrganization";
import { useMemo, useState } from "react";
import { useGetUserOrganizations } from "@/hooks/services/engagement";
import _ from "lodash";
import { Button, ReactSelect } from "../custom";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
export default function EngagementHome() {
  const {
    qas,
    qaLoading,
    quizLoading,
    quizzes,
    getQas,
    getQuizzes,
    getForm,
    forms,
    formLoading,
  } = useGetUserEngagements();
  const {
    organizations: organizationList,
    getOrganizations,
    loading: isLoading,
  } = useGetUserOrganizations();
  const [isOpen, setOpen] = useState(false);
  const form = useForm({});

  const formattedList = useMemo(() => {
    const restructuredList = organizationList?.map(
      ({ organizationAlias, organizationName }) => {
        return { value: organizationAlias, label: organizationName };
      }
    );
    return _.uniqBy(restructuredList, "value");
  }, [organizationList]);

  function onClose() {
    setOpen((prev) => !prev);
  }

  const org = form.watch("workspaceAlias");

  console.log("org", org)

  const filteredData = useMemo(() => {
    if (org && org !== undefined && !qaLoading && !quizLoading && !formLoading) {
      return {
        forms: Array.isArray(forms)
          ? forms?.filter((v) => v?.workspaceAlias === org)
          : [],
        qas: Array.isArray(qas)
          ? qas?.filter((v) => v?.workspaceAlias === org)
          : [],
        quizzes: Array.isArray(quizzes)
          ? quizzes?.filter((v) => v?.workspaceAlias === org)
          : [],
      };
    } else
      return {
        forms,
        qas,
        quizzes,
      };
  }, [form, org, qaLoading, quizLoading, formLoading, forms, quizzes, qas]);

  return (
    <>
      <div className="w-full mx-auto max-w-7xl ">
        <div className="w-full mt-8 sm:mt-10 flex items-center justify-between gap-x-2 mb-4 sm:mb-6">
          <h2 className="font-semibold text-base sm:text-lg">Engagements</h2>

          <Form {...form}>
            <form className="w-[60%] sm:w-[300px] grid grid-cols-7 items-end gap-x-2">
             <div className="w-full col-span-4">
             <FormField
                control={form.control}
                name="workspaceAlias"
                render={({ field }) => (
                  <InputOffsetLabel label="">
                    <ReactSelect
                      {...field}
                      placeHolder="Select "
                      options={formattedList}
                    />
                  </InputOffsetLabel>
                )}
              />
             </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClose();
                }}
                className="hover:bg-basePrimary w-full col-span-3   text-basePrimary  rounded-md border border-basePrimary hover:text-gray-50 gap-x-2 h-10 px-2 font-medium"
              >
                <PlusCircle size={20} />
                <p className="text-xs">Workspace</p>
              </Button>
            </form>
          </Form>
        </div>

        {qaLoading || quizLoading || formLoading ? (
          <EngagementEmptyState />
        ) : (
          <div className="w-full grid h-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {!qaLoading &&
              !quizLoading &&
              !formLoading &&
              forms?.length === 0 &&
              qas?.length === 0 &&
              quizzes?.length === 0 && (
                <div className="w-full h-[200px] col-span-full flex items-center justify-center">
                  <h2 className="text-center font-medium text-lg">
                    Your Engagements will appear here
                  </h2>
                </div>
              )}
            {Array.isArray(filteredData?.quizzes) &&
              filteredData?.quizzes.map((quiz, index) => (
                <QuizCard refetch={getQuizzes} key={index} quiz={quiz} />
              ))}
            {Array.isArray(filteredData?.qas) &&
              filteredData?.qas.map((qa, index) => (
                <QaCard key={index} qa={qa} refetch={getQas} />
              ))}
            {Array.isArray(filteredData?.forms) &&
              filteredData?.forms.map((form, index) => (
                <FormCard key={index} form={form} refetch={getForm} />
              ))}
          </div>
        )}
      </div>
      {isOpen && (
        <CreateOrganization close={onClose} refetch={getOrganizations} />
      )}
    </>
  );
}
