import { TOrganization } from "./home";

export interface TEngagementFormQuestion {
    id: number;
    created_at: string;
    title: string;
    description: string;
    coverImage: string | any;
    createdBy: number;
    workspaceAlias:string;
    updatedAt: string;
    isActive: boolean;
    expirationDate: string;
    questions: {
      question: string;
      questionImage?: string | any;
      selectedType: string | null;
      isRequired: boolean;
      questionId: string;
      optionFields?: any;
      questionDescription?:string;
    }[];
    formAlias: string;
    eventAlias: string;
    formSettings: {
      isConnectedToEngagement: boolean;
      showForm: string;
      redirectUrl?: string;
      isCollectUserEmail: boolean;
      isCoverScreen: boolean;
      displayType: string;
      questionPerSlides?: string;
      titleFontSize: string;
      headingFontSize: string;
      backgroundColor: string;
      textColor: string;
      buttonColor: string;
      textFontSize: string;
      isCoverImage: boolean;
      buttonText: string;
      startButtonText: string;
    };
  }
  
  export interface TEngagementFormAnswer {
    id: number;
    created_at: string;
    formAlias: string;
    userId: string | null;
    submittedAt: string;
    responses: {
      type: string;
      questionId: string;
      response?: any;
    }[];
    formResponseAlias: string;
    eventAlias: string;
    attendeeAlias: string;
    attendeeEmail?: string;
    attendeeId: number | null;
    formEngagementPoints: number | null;
  }
  
  export interface TFormattedEngagementFormAnswer {
    id: number;
    created_at: string;
    formAlias: string;
    userId: string | null;
    submittedAt: string;
    type: string;
    questionId: string;
    response?: any;
    formResponseAlias: string;
    eventAlias: string;
    attendeeAlias: string;
    attendeeEmail?: string;
    attendeeId: number | null;
    question: string;
    questionImage?: string | any;
    optionFields: any;
  }

  export interface TOrganizationForm extends TEngagementFormQuestion {
    organization: TOrganization;
  }
  