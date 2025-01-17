import { HomeIcon } from "@/constants";
import Link from "next/link";
import { IconType } from "react-icons";

export function LeadingHeadRoute({
  name,
  Icon,
  onClick,
}: {
  Icon: IconType;
  onClick: () => void;
  name: string;
}) {
  return (
    <>
      <button onClick={onClick} className="flex sm:hidden">
        <Icon size={22} />
        <p className="text-sm">Back</p>
      </button>
      <div className="hidden sm:flex items-center gap-x-1">
        <Link href={"/home"} className="flex items-center gap-x-1">
          <HomeIcon />
          <p>Home</p>
        </Link>
        <span>/</span>
        <p className="text-basePrimary capitalize">{name}</p>
      </div>
    </>
  );
}
