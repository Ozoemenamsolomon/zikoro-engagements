import { HomeIcon } from "@/constants";
import Link from "next/link";

export function LeadingHeadRoute({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-x-1">
      <Link href={"/home"} className="flex items-center gap-x-1">
        <HomeIcon />
        <p>Home</p>
      </Link>
      <span>/</span>
      <p className="text-basePrimary capitalize">{name}</p>
    </div>
  );
}
