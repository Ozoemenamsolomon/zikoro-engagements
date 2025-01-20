import {nanoid} from "nanoid"
export async function isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
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
  divRef: React.RefObject<HTMLDivElement>
) {
  const div = divRef.current;

  if (div) {
    

    
    div.style.height = `${window.innerHeight -100}px`;
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

  export const deploymentUrl = "https://enagagement.zikoro.com"

  export function formatPosition(position: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = position % 100;
    
    
    if (remainder >= 11 && remainder <= 13) {
      return `${position}th`;
    }
    
    const suffix = suffixes[position % 10] || suffixes[0];
    return `${position}${suffix}`;
  }
