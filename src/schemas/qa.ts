import { z } from "zod";

export const eventQaCreationSchema = z.object({
    description: z.any(),
    coverTitle: z.string().min(3, { message: "Title is required" }),
    coverImage: z.any(),
    workspaceAlis: z.string().min(2, { message: "Organization is required" }),
  });