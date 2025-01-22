// import React from "react";
// import { isImageValid } from "@/utils";

// interface WithImageValidationProps {
//   src: string;
//   alt: string;
//   className: string;
//   width: number;
//   height: number;
// }

// const withImageValidation = <P extends object>(
//   Component: React.ComponentType<P & { isValid: boolean }>
// ) => {
//   return async (props: Omit<P, "isValid"> & WithImageValidationProps) => {
//     const isValid = await isImageValid(props.src);
//     return <Component {...(props as P)} isValid={isValid} />;
//   };
// };

// export default withImageValidation;
