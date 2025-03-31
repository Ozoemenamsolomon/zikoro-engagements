import { parseISO, format } from "date-fns";
import * as crypto from "crypto";
import {nanoid} from "nanoid"
import { CertificateRecipient, TAttendeeCertificate, TOrganization } from "@/types/home";
export async function isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
  // call phone
export function phoneCall(number?: string) {
  window.open(`tel:${number}`, "_blank");
}
// chat on whatsapp
export function whatsapp(number?: string, message?: string) {
  let url = `https://wa.me/${number}`;
  if (message) {
    // Encode the message to be included in the URL
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }
  window.open(url, "_blank");
}

// send mail
export function sendMail(mail?: string) {
  window.open(`mailto:${mail}`, "_blank");
}

  export function generateAlias(): string {
    const alias = nanoid().replace(/[-_]/g, "").substring(0, 20);
  
    return alias;
  }

  export function generateInteractionAlias(): string {
    const alias = nanoid().replace(/[-_]/g, "").substring(0, 6).toUpperCase();
  
    return alias;
  }


export function calculateAndSetWindowHeight(
  divRef: React.RefObject<HTMLDivElement>, ded: number = 100
) {
  const div = divRef.current;

  if (div) {
    

    
    div.style.height = `${window.innerHeight -ded}px`;
  }
}
  

  
  
  export async function uploadFile(file: File | string, type: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cloud_name", "zikoro");
    formData.append("upload_preset", "w5xbik6z");
    formData.append("folder", "ZIKORO");
    if (type === "video") {
      formData.append("resource_type", "video");
    } else if (type === "pdf") {
      formData.append("resource_type", "raw");
    
    } 
    else if (type === "audio") {  
      formData.append("resource_type", "audio");
    }
    else {
      formData.append("resource_type", "image");
    }
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/zikoro/${
          type === "pdf" ? "raw" : type
        }/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (response.ok) {
        const data = await response.json();
  
        return data.secure_url;
      } else {
        console.error("Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }
  export const formatReviewNumber = (number: number): string => {
    if (number === 0) {
      return "0";
    }
    const suffixes = ["", "k", "M", "B", "T"];
    const suffixNum = Math.floor(Math.log10(number) / 3);
  
    if (suffixNum === 0) {
      return number.toString();
    }
  
    const shortValue = (number / Math.pow(1000, suffixNum)).toFixed(1);
    return shortValue + suffixes[suffixNum];
  };

  export const deploymentUrl = "https://engagements.zikoro.com"

  export function formatPosition(position: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = position % 100;
    
    
    if (remainder >= 11 && remainder <= 13) {
      return `${position}th`;
    }
    
    const suffix = suffixes[position % 10] || suffixes[0];
    return `${position}${suffix}`;
  }


  export function formateJSDate(date: Date): string {
    
  
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, "MM/dd/yyyy");
  }
  

  export function formatText(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2") 
      .replace(/_/g, " ")
      .trim(); 
  }

  export function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  export function createHash(data: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(data);
    const fullHash = hash.digest("hex");
    return fullHash.substring(0, 12);
  }

  type Context = {
    asset: any;
    recipient: CertificateRecipient;
    organization: TOrganization;
  };

  export function replaceSpecialText(input: string, context: Context): string {
    const pattern = /#{(.*?)#}/g;
  
    if (pattern.test(input)) {
    } else {
    }
  
    return input.replaceAll(/#{(.*?)#}/g, (match, value) => {
      // console.log(value, context.asset?.attributes, "attribute");
      if (
        context.asset?.attributes &&
        context.asset?.attributes?.includes(value.trim())
      ) {
        return context?.recipient?.metadata?.[value.trim()] || "N/A";
      }
  
      switch (value.trim()) {
        case "first_name":
          return context.recipient.recipientFirstName;
        case "last_name":
          return context.recipient.recipientLastName;
        case "recipient_email":
          return context.recipient.recipientEmail;
        case "certificateId":
          return context.recipient.certificateId;
        case "certificate_link":
          return (
            "https://www.credentials.zikoro.com/credentials/verify/certificate/" +
            context.recipient.certificateId
          );
        case "organization_name":
          return context.organization.organizationName;
        case "organisation_logo":
          return context.organization.organizationLogo || "";
        default:
          return match;
      }
    });
  }