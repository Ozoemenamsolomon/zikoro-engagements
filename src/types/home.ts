import { TUser } from "./user";

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