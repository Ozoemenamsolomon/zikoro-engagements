"use client";

import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
export function UploadImage({
  image,
  name,
  form,
}: {
  name: string;
  form: UseFormReturn<z.infer<any>, any, any>;
  image: string | null;
}) {
  return (
    <div className="w-full rounded-lg p-4 border bg-basePrimary-100 h-72 flex flex-col items-center justify-center relative">
      <p>Cover Image</p>
      <p className="bg-zinc-700 mt-2 rounded-lg text-white text-mobile sm:text-sm p-2">
        Upload
      </p>
      {image && (
        <Image
          src={image}
          width={500}
          height={600}
          className="w-full h-72 inset-0 z-10 object-cover rounded-lg absolute"
          alt=""
        />
      )}
      <label
        htmlFor="engagementImageUpload"
        className="w-full h-full absolute inset-0 z-20"
      >
        <input
          id="eventImageUpload"
          type="file"
          {...form.register(name)}
          accept="image/*"
          className="w-full h-full absolute inset-0 "
          hidden
        />
      </label>
    </div>
  );
}
