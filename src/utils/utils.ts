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
    const alias = nanoid().replace(/-/g, "").substring(0, 20);
  
    return alias;
  }
  