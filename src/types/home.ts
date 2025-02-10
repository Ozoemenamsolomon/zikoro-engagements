import { AttendeeSchema } from "@/schemas/global";
import { TUser } from "./user";
import { z } from "zod";


export interface ISubscription {
  id: number;
  created_at: string;
  userId: number;
  organizationId: number;
  subscriptionType: string;
  amountPayed: number;
  startDate: string;
  expirationDate: string;
  discountCode: string;
  discountValue: number;
  currency: string;
  monthYear: string;
  user: TUser;
  planPrice: number;
  organizationAlias: string;
}


export enum CreateType {
    qa,
    quiz,
    form,
    polls,
    wordCloud,
}


export interface TOrganization {
    id: number;
    created_at: string;
    organizationName: string;
    organizationSlug: string;
    subscriptionPlan: string;
    subscritionStartDate: string;
    subscriptionEndDate: string;
    organizationOwner: string;
    organizationAlias: string;
    BillingAddress: string;
    TaxID: string;
    payoutAccountDetails: IPayoutAccountDetails | null;
    organizationOwnerId: number;
    organizationType: string;
    organizationLogo: string;
    favicon: string;
    country: string;
    eventPhoneNumber: string;
    eventWhatsApp: string;
    eventContactEmail: string;
    x: string;
    linkedIn: string;
    instagram: string;
    facebook: string;
    subDomain: string;
    certificateAsset: TCertificateAsset;
    teamMembers: TOrganizationTeamMember[];
    subscriptionExpiryDate:string;
  }
  
  export interface IPayoutAccountDetails {
    bankCountry: string;
    currency: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
  }
  
  type TOrganizationTeamMember = {
    userId: string;
    userEmail: string;
    userRole: string;
    workspaceAlias:string;
  };
  export interface TCertificateAsset {
    elements: string[];
    backgrounds: string[];
  }
  


export interface PaymentConfigProps {
    email: string;
    amount?: number;
    reference: string;
    currency?: string;
  }

  export type PartnerIndustry = {
    name: string;
    color: string;
  };
  
  interface TEventStatusDetail {
    createdAt: string;
    status: string;
    user: string;
  }


interface PricingType {
  ticketQuantity: string;
  attendeeType: string;
  description?: string;
  price: string;
  validity: string;
  accessibility: boolean;
}
  export interface TEvent {
    affiliateSettings: any;
    selfCheckInAllowed: boolean;
    createdAt: string;
    createdBy: string;
    description: string;
    email: string;
    endDateTime: string;
    eventAddress: string;
    eventCategory: string;
    eventCity: string;
    eventCountry: string;
    eventTitle: string;
    eventVisibility: string;
    expectedParticipants: number;
    facebook: string;
    id: number;
    industry: string;
    instagram: string;
    organisationId: string;
    x: string;
    linkedin: string;
    locationType: "Hybrid" | "Onsite" | "Virtual" | string;
    organisationLogo: string;
    organisationName: string;
    phoneNumber: string;
    prerequisites: string;
    pricing: PricingType[];
    pricingCurrency: string;
    published: boolean;
    startDateTime: string;
    trainingDuration: string;
    whatsappNumber: string;
    registered: number;
    partnerIndustry: PartnerIndustry[];
    eventPoster: string;
    exhibitionHall: { name: string; capacity: string }[];
    sponsorCategory: { type: string; id: string }[];
    eventAlias: string;
    eventTimeZone: string;
    eventStatusDetails: TEventStatusDetail[];
    eventStatus: string;
    attendeePayProcessingFee: boolean;
    explore: boolean;
    eventAppAccess: string;
    eventWebsiteSettings: { title: string; status: boolean }[];
    sessionTrack: { name: string; color: string }[];
    partnerDetails: any;
    includeJoinEventLink: boolean;
  }


  export type TSessionFile<T> = {
    size: string;
    file: T;
    name: string;
    id: string;
  };
  export interface TAgenda {
    sessionTitle: string;
    id: number;
    description: string;
    created_at: string;
    activity: string;
    startDateTime: string;
    endDateTime: string;
    Track: string;
    sessionType: string;
    sessionVenue: string;
    sessionUrl: string;
    sessionSpeakers: TAttendee[];
    sessionModerators: TAttendee[];
    sessionSponsors: TPartner[];
    sessionFiles: TSessionFile<string>[];
    sessionViews: number;
    sessionViewsDetails: TUser[];
    sessionCheckin: string;
    sessionCheckinDetails: JSON;
    eventId: string;
    eventAlias: string;
    sessionAlias: string;
    isMyAgenda:boolean;
    engagementAlias: string|null;
    engagementType: string | null;
  }
  
  export interface TSessionAgenda {
    timeStamp: { start: string; end: string };
    sessions: TAgenda[];
  }
  
  export interface TReview {
    rating: number;
    comments: string;
    sessionId?: number;
    attendeeId?: number;
    eventAlias?:string
    points: number;
    sessionAlias: string
    createdAt?: string;
  }
  
  export type TFeedBack = TReview & {
    attendees: TAttendee
  }
  
  export interface TMyAgenda {
    sessionId: number;
    attendeeId: number;
    sessionAlias: string;
    points: number;
    eventAlias: string;
  }
  

  export type TCompletedFields = Array<keyof z.infer<typeof AttendeeSchema>>;

export type TAttendee = z.infer<typeof AttendeeSchema> & {
  id?: number;
  eventRegistrationRef?: string;
  ticketType: string;
  paymentLink?: string;
  badge?: string;
  eventAlias: string;
  registrationCompleted: boolean;
  userId?: number;
  registrationDate: Date | string;
  userEmail: string;
  eventId: string;
  favourite: boolean;
  tags: string[];
  checkin?: { date: Date; checkin: boolean }[];
  inviteSource: string | null;
  attendeeAlias: string;
  checkInPoints: number;
  attendeeProfilePoints: number;
  completedFields: TCompletedFields;
  speakingAt: { session: TAgenda; sessionLink: string }[];
  moderatingAt: { session: TAgenda; sessionLink: string }[];
  archive: boolean;
};


export interface IndustryType {
  name: string;
  color: string;
}

export interface PartnerBannerType {
  file: string;
  link: string;
}

export interface TPartner {
  banners: PartnerBannerType[];
  boothNumber: string[];
  boothStaff: TAttendee[];
  city: string;
  companyLogo: string;
  companyName: string;
  country: string;
  stampIt: boolean;
  created_at: string;
  description: string;
  email: string;
  eventId: number;
  eventName: string;
  exhibitionHall: string;
  id: number;
  industry: string;
  jobs: PartnerJobType[];
  media: string;
  partnerType: string;
  phoneNumber: string;
  offers: PromotionalOfferType[];
  website: string;
  whatsApp: string;
  sponsorCategory: string;
  eventAlias: string;
  sponsoredSession: { session: TAgenda; sessionLink: string }[];
  partnerAlias: string;
  organizerEmail: string;
  tierName: string;
  amountPaid: number;
  partnerStatus: string;
  currency: string;
  paymentReference: string;
  contactLastName:string;
  contactFirstName: string;
}

export interface PartnerJobType {
  jobTitle: string;
  applicationLink?: string;
  maxSalary: string;
  minSalary: string;
  salaryDuration: string;
  flexibility: string;
  description: string;
  city: string;
  country: string;
  employmentType: string;
  experienceLevel: string;
  qualification: string;
  currencyCode: string;
  partnerId: string;
  companyName: string;
  applicationMode: string;
  email?: string;
  whatsApp?: string;
  id: string;
}

export interface PromotionalOfferType {
  serviceTitle: string;
  endDate: string;
  productPrice: string;
  productPromo: string;
  offerDetails: string;
  voucherCode: any;
  redeem: "email" | "url" | "whatsapp";
  url: string | undefined;
  whatsApp: string | undefined;
  email: string | undefined;
  currencyCode: string;
  partnerId: string;
  companyName: string;
  productImage: any;
  id: string;
}
