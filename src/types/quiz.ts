import { z } from "zod";
import { quizQuestionSchema } from "@/schemas/quiz";
import { AvatarFullConfig } from "react-nice-avatar";
import { TOrganization } from "./home";

export enum OptionType {
  text,
  image,
}
export interface TLiveQuizParticipant {
  quizParticipantId: string;
  quizAlias: string;
  nickName: string;
  joinedAt: string;
  participantImage: Required<AvatarFullConfig>;
  email?: string;
  phone?: string;
  attemptedQuiz?: TQuiz<TRefinedQuestion[]>;
  formResponseAlias?: string | null;
}
export type TQuizParticipant = {
  id: string;
  nickName: string;
  joinedAt: string;
  participantImage: Required<AvatarFullConfig>;
  email?: string;
  phone?: string;
  attemptedQuiz?: TQuiz<any[]>;
  formResponseAlias?: string | null;
};
export interface TQuiz<T> {
  id: number;
  created_at: string;
  lastUpdated_at: string;
  workspaceAlias: string;
  quizName: string;
  createdBy: number;
  coverTitle: string;
  liveMode: any;
  description: string;
  interactionType: string;
  integrationAlias?:string;
  formAlias?: string;
  coverImage: string;
  branding: { poweredBy: boolean; eventName: boolean };
  questions: T;
  totalDuration: number;
  totalPoints: number;
  eventAlias: string;
  quizAlias: string;
  quizParticipants: TQuizParticipant[];
  accessibility: {
    visible: boolean;
    review: boolean;
    countdown: boolean;
    timer: boolean;
    countdownTransition: boolean;
    countDown: number;
    disable: boolean;
    live: boolean;
    isCollectPhone: boolean;
    isCollectEmail: boolean;
    showAnswer: boolean;
    showResult: boolean;
    isForm: boolean;
    playMusic: boolean,
    musicList: {label:string, value:string}[] | null,
    music: {label:string, value:string} | null,
    eventAlias: string;
    //> new
    preMadeType?: string;
    isBackgroundImage?: boolean;
    backgroundImage?: string;
    backgroundBrightness?: number;
    isPreMade?: boolean;
    isBackgroundColor?:boolean;
    textColor?:string;
    backgroundColor?:string;
    buttonColor?:string;
    //> 
  };
}

export interface TOrganizationQuiz extends TQuiz<TQuestion[]> {
  organization: TOrganization;
}

export type TQuestion = z.infer<typeof quizQuestionSchema> & {
  id: string;
};

export type TRefinedQuestion = {
  id: string;
  question: string;
  questionImage?: any;
  duration?: string;
  points?: string;
  interactionType: string;
  feedBack?: any;
  options: {
    optionId: string;
    option?: any;
    isAnswer: string;
    isCorrect: boolean | string;
  }[];
};

export interface TAnswer {
  id: number;
  created_at: string;
  attendeeId: string | null;
  attendeeName: string;
  quizId: number;
  quizParticipantId: string;
  avatar: Required<AvatarFullConfig>;
  questionId: string;
  startTime: string;
  endTime: string;
  maxPoints: number;
  maxDuration: number;
  attendeePoints: number;
  answerDuration: number;
  quizAlias: string;
  selectedOptionId: { optionId: string };
  email: string;
  phone: string;
  correctOptionId: { optionId: string };
  eventAlias: string;
  answeredQuestion: TRefinedQuestion;

}

export interface TExportedAnswer {
  id: number;
  created_at: string;
  attendeeId: string | null;
  attendeeName: string;
  quizId: number;
  quizParticipantId: string;
  startTime: string;
  endTime: string;
  maxPoints: number;
  maxDuration: number;
  attendeePoints: number;
  answerDuration: number;
  selectedOption: string
  email: string;
  phone: string;
  eventAlias: string;
  question:string;
  

}

export interface TConnectedUser {
  connectedAt: string;
  userId: string;
}
