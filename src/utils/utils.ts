
export async function isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }