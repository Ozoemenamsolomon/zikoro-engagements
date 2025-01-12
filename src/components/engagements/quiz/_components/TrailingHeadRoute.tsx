import React from "react";

export function TrailingHeadRoute({
  Icon,
  title,
  as: Component = "div",
  onClick,
}: {
  title: string;
  Icon: React.ElementType;
  as: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <Component
      onClick={() => onClick?.()}
      className="flex items-center gap-x-2"
    >
      <Icon />
      <p>{title}</p>
    </Component>
  );
}
