"use client";

import React from "react";
import Skeleton from "./Skeleton";

const HouseCardSkeleton = () => {
  return (
    <div className="house-link-container" style={{ cursor: 'default' }}>
      <div className="image">
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>
      <div className="text" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="80%" height="1.35rem" borderRadius="8px" />
        <Skeleton width="40%" height="1rem" borderRadius="8px" />
        <div style={{ marginTop: '0.5rem' }}>
          <Skeleton width="60%" height="1.15rem" borderRadius="8px" />
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          <Skeleton width="30%" height="0.85rem" borderRadius="8px" />
        </div>
      </div>
      <div className="btn-container" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
        <Skeleton width="100%" height="40px" borderRadius="12px" />
      </div>
    </div>
  );
};

export default HouseCardSkeleton;
