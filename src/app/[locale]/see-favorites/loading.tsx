import React from "react";
import HouseListSkeleton from "@/components/Skeleton/HouseListSkeleton";

export default function Loading() {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '2rem', borderRadius: '8px' }} />
      </div>
      <HouseListSkeleton count={6} />
    </div>
  );
}
