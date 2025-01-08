import { z } from "zod";

export const eventQaCreationSchema = z.object({
    description: z.any(),
    coverTitle: z.string().min(3, { message: "Title is required" }),
    coverImage: z.any(),
    workspaceAlis: z.string().min(2, { message: "Organization is required" }),
  });

  export const eventQaSettingSchema = z.object({
    description: z.any(),
    coverTitle: z.string().min(3, { message: "Title is required" }),
    coverImage: z.any(),
    
  });

  export const eventQaAskAndReplySchema = z.object({
    anonymous: z.boolean(),
    content: z.string().min(1, {message:"Field is rewuired"}),
    userNickName: z.string().optional()
})