import { z } from "zod";

export const eventQaCreationSchema = z.object({
  description: z.any(),
  coverTitle: z.string().min(3, { message: "Title is required" }),
  coverImage: z.any(),
  workspaceAlias: z.string().min(2, { message: "Organization is required" }),
});

export const eventQaSettingSchema = z.object({
  description: z.any(),
  coverTitle: z.string().min(3, { message: "Title is required" }),
  coverImage: z.any(),
  workspaceAlias: z.string().min(2, { message: "Organization is required" }),
  prevworkspaceAlias: z.string().optional(),
  eventAlias: z.string().optional(),
});

export const eventQaAskAndReplySchema = z.object({
  anonymous: z.boolean(),
  content: z.string().min(1, { message: "Field is required" }),
  userNickName: z.string().optional(),
});
