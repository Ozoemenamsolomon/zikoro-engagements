import * as z from "zod";

export const formCreationSchema = z.object({
  description: z.any(),
  title: z.string().min(3, { message: "Title is required" }),
  coverImage: z.any(),
  workspaceAlias: z.string().min(2, { message: "Organization is required" }),
  formSettings: z.object({
    isConnectedToEngagement: z.boolean(),
    showForm: z.string(),
    redirectUrl: z.string().optional(),
    isCoverScreen: z.boolean(),
    displayType: z.string(),
    questionPerSlides: z.string().optional(),
    titleFontSize: z.string(),
    headingFontSize: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    buttonColor: z.string(),
    buttonText: z.string(),
    startButtonText: z.string(),
    textFontSize: z.string(),
    isCoverImage: z.boolean(),
    isCollectEmail: z.boolean(),
    isCollectPhone: z.boolean(),
    connectToEvent: z.boolean(),
    isRedirectUrl: z.boolean(),
    showResult: z.boolean(),
    engagementId: z.string().optional(),
    engagementType: z.string().optional(),
    hideNumber: z.boolean(),
    eventAlias:z.string().optional()
  }).optional(),
});

export const formQuestion = z.object({
  question: z.string().min(3, { message: "Question is required" }),
  questionImage: z.any(),
  selectedType: z.string().optional().nullable(),
  optionFields: z.any(),
  questionSettings: z.any(),
  isRequired: z.boolean(),
  questionId: z.string(),
  showDescription: z.boolean(),
  questionDescription: z.string().optional(),
});

export const formQuestionSchema = z.object({
  questions: z.array(formQuestion),
  title: z.string().min(3, { message: "Title is required" }),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export const formSettingSchema = z.object({
  title: z.string().min(3, { message: "Title is required" }),
  description: z.string().optional(),
  coverImage: z.any(),
  wAlias: z.any(),
  formSettings: z.object({
    isConnectedToEngagement: z.boolean(),
    showForm: z.string(),
    redirectUrl: z.string().optional(),
    isCoverScreen: z.boolean(),
    displayType: z.string(),
    questionPerSlides: z.string().optional(),
    titleFontSize: z.string(),
    headingFontSize: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    buttonColor: z.string(),
    buttonText: z.string(),
    startButtonText: z.string(),
    textFontSize: z.string(),
    isCoverImage: z.boolean(),
    isCollectEmail: z.boolean(),
    isCollectPhone: z.boolean(),
    connectToEvent: z.boolean(),
    isRedirectUrl: z.boolean(),
    showResult: z.boolean(),
    engagementId: z.string().optional(),
    engagementType: z.string().optional(),
    hideNumber: z.boolean(),
    eventAlias: z.string().optional(),
    
  }),
});

export const formAnswerSchema = z.object({
  attendeeEmail: z.any(),
  formResponseAlias: z.string(),
  formAlias: z.string(),
  startedAt: z.string(),
  viewed: z.number(),
  questions: z.array(formQuestion),
  responses: z.array(
    z.object({
      type: z.string(),
      response: z.any(),
      questionId: z.string(),
    })
  ),
});
