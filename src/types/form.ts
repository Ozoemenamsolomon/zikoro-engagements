import { TOrganization } from "./home";

export interface TEngagementFormQuestion {
  id: number;
  created_at: string;
  title: string;
  description: string;
  coverImage: string | any;
  createdBy: number;
  workspaceAlias: string;
  integrationAlias?: string;
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
    questionDescription?: string;
    questionSettings?: any;
    showDescription: boolean;
  }[];
  formAlias: string;
  eventAlias: string;
  formSettings: {
    isConnectedToEngagement: boolean;
    showForm: string;
    redirectUrl?: string;
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
    isCollectEmail: boolean;
    isCollectPhone: boolean;
    connectToEvent: boolean;
    showResult: boolean;
    isRedirectUrl: boolean;
    engagementId?: string;
    engagementType?: string;
    hideNumber: boolean;
    eventAlias?: string;
    hideLabel?: boolean;
    labellingType?: string;
    preMadeType?: string;
    isBackgroundImage?: boolean;
    backgroundImage?: string;
    backgroundBrightness?: number;
    isPreMade?: boolean;
    endScreenSettings?: TEndScreenSettings;
  };
}

export interface TEndScreenSettings {
  title?: string;
  subText?: string;
  buttonText?: string;
  buttonUrl?: string;
  x?: string;
  linkedIn?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  showButton?:boolean;
  socialLink?:boolean;
  showCreateForm?:boolean
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
  startedAt: string;
  viewed: number;
  submitted: number;
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
  startedAt: string;
  viewed: number;
  submitted: number;
}

export interface TOrganizationForm extends TEngagementFormQuestion {
  organization: TOrganization;
}
