
import { LoaderAlt } from "styled-icons/boxicons-regular";

export function LoadingState() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <LoaderAlt className="animate-spin" size={30} />
    </div>
  );
}
