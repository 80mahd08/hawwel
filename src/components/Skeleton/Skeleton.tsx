"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  circle?: boolean;
  style?: React.CSSProperties;
}

const Skeleton = ({ width, height, borderRadius, className = "", circle = false, style }: SkeletonProps) => {
  const combinedStyle: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: borderRadius,
    ...style
  };

  return (
    <div 
      className={`skeleton ${circle ? "circle" : ""} ${className}`} 
      style={combinedStyle}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
