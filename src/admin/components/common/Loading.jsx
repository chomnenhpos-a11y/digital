import React from "react";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

export const DotCircleWithLabelDemo = ({
  size = "sm",
  label = "Loading...",
  className = "flex-row gap-2",
  ...props
}) => {
  return (
    <LoadingIndicator
      type="dot-circle"
      size={size}
      label={label}
      className={className}
      {...props}
    />
  );
};