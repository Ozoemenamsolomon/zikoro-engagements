export interface CredentialsIntegration {
    id: number;
    created_at: Date;
    integrationName: string;
    integrationAlias: string;
    integrationType: string;
    totalIssued: number;
    disconnect: boolean;
    integrationSettings: Record<string, unknown> | null;
    workspaceAlias: string;
  templateId: string;
  credentialId:string;
  }


  export interface RecipientEmailTemplate {
    id: number;
    createdAt: string;
    body: string;
    showLogo: boolean;
    showSocialLinks: boolean;
    logoUrl: string | null;
    subject: string;
    senderName: string;
    replyTo: string | null;
    templateName: string;
    workspaceAlias: string;
    createdBy: number;
    templateAlias: string;
    buttonProps: { text: string; backgroundColor: string; textColor: string };
  }

//   type Context = {
//     asset: TAttendeeCertificate | TAttendeeBadge;
//     recipient: CertificateRecipient;
//     organization: TOrganization;
//   };