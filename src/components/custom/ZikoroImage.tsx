import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import withImageValidation from "./withImageValidation";

interface ZikoroImageProps {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  isValid: boolean;
}

const ZikoroImage: React.FC<ZikoroImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  isValid,
}) => {
  return isValid ? (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ) : (
    <div className={cn("bg-basePrimary-100", className)}></div>
  );
};

export default withImageValidation(ZikoroImage);