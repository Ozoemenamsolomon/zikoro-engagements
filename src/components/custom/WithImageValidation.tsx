
import React from "react";
import {ZikoroImage} from "./ZikoroImage";
import { isImageValid } from "@/utils";

interface WithImageValidationProps {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
}

const withImageValidation = (Component: React.FC<any>) => {
  const WrappedComponent: React.FC<WithImageValidationProps> = async (
    props
  ) => {
    const isValid = await isImageValid(props.src);
    return <Component {...props} isValid={isValid} />;
  };

  return WrappedComponent;
};

export default withImageValidation(ZikoroImage);
