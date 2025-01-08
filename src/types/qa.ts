
export interface TQaTag {
    name: string;
    color: string;
  }
  export interface TQa {
    id: number;
    lastUpdated_at: string;
    QandAAlias: string;
    coverImage: string;
    eventAlias: string;
    coverTitle: string;
    created_at: string;
    description: string;
    workspaceAlis: string;
    createdBy: number;
    tags: TQaTag[] | null;
    branding: { poweredBy: boolean; eventName: boolean };
    accessibility: {
      visible: boolean;
      disable: boolean;
      live: boolean;
      allowAnonymous: boolean;
      mustReviewQuestion:boolean;
      cannotAskQuestion:boolean;
      canRespond:boolean;
      canPin:boolean;
      indicateAnsweredQuestions:boolean;
      canTag:boolean;
    };
  }
  
  export type TQAQuestionResponse = Omit<
    TQAQuestion,
    "moderationDetails" | "Responses" | "questionStatus" | "QandAAlias" | "id"
  >;
  
  export interface TQAQuestion {
    id: number;
    questionAlias: string;
    QandAAlias: string;
    userId: string;
    userNickName: string;
    userImage: string;
    content: string;
    isAnswered: boolean;
    Responses: TQAQuestionResponse[];
    vote: number;
    voters: {
      userId: string;
    }[];
    anonymous: boolean;
    questionStatus: string;
    isPinned: boolean;
    moderationDetails: JSON;
    created_at: string;
    tags: TQaTag | null
  }
  