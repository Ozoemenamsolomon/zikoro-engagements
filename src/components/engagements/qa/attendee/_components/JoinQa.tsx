"use client";

import Image from "next/image";
import {

  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useFetchData } from "@/hooks/services/requests";
import { TQa } from "@/types/qa";

 const joinSchema = z.object({
    code: z.string().min(5, { message: "Code is required" }),
  });

export default function JoinQA() {
  const { getData } = useFetchData<TQa>("/engagements/qa");
  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
  });

  async function onSubmit(value: z.infer<typeof joinSchema>) {
    // window.open(`${pathname}/${value.code}`, "_self");
    const response = await getData(value.code);

    window.open(
      `/e/${response?.workspaceAlis}/qa/a/${response?.QandAAlias}`,
      "_self"
    );
  }
  return (
    <div className="w-full bg-gradient-to-t from-[#001fcc]/30 fixed inset-0 h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col-reverse gap-6 items-center justify-center w-full px-8 sm:px-4 sm:flex-row h-full mx-auto max-w-4xl"
        >
          <div className="flex flex-col w-full sm:w-[50%] items-start justify-start gap-y-2">
            <h2 className="font-semibold text-lg sm:text-2xl">
              Join Event Interaction
            </h2>
            <p className="mb-4">Enter the code to join the interaction</p>

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter the code"
                      {...form.register("code")}
                      className=" placeholder:text-sm h-11 border-basePrimary bg-transparent  placeholder:text-zinc-500 text-zinv-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-fit  mt-2 px-4 h-11 text-white bg-basePrimary rounded-lg"
            >
              Join Interaction
            </Button>
          </div>

          <Image
            src="/entrypoint.png"
            alt=""
            className="w-[50%] max-h-[350px]"
            width={500}
            height={500}
          />
        </form>
      </Form>
    </div>
  );
}
