import { z } from "zod";

export const eventQaSettingSchema = z.object({
    description: z.any(),
    coverTitle: z.string().min(3, { message: "Title is required" }),
    coverImage: z.any(),
    organisationAlias: z.string().min(2, { message: "Organization is required" }),
  });