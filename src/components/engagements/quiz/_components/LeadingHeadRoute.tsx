import { HomeIcon } from "@/constants";

export function LeadingHeadRoute({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-x-1">
      <HomeIcon />
      <p>Home</p>
      <span>/</span>
      <p className="text-basePrimary capitalize">{name}</p>
    </div>
  );
}
