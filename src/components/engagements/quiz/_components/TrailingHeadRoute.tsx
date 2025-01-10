import React from "react";

export function TrailingHeadRoute({
  Icon,
  title,
}: {
  title: string;
  Icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-x-2">
      <Icon />
      <p>{title}</p>
    </div>
  );
}
