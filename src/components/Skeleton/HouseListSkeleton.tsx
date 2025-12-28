"use client";

import React from "react";
import HouseCardSkeleton from "./HouseCardSkeleton";

const HouseListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="houses-list">
      {Array.from({ length: count }).map((_, i) => (
        <HouseCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default HouseListSkeleton;
