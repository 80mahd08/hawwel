"use client";

import React from "react";
import Skeleton from "./Skeleton";

const FeaturedPropertiesSkeleton = () => {
  return (
    <section className="featured-properties-section">
      <div className="container">
        <div className="section-header">
          <Skeleton width="40%" height="2.5rem" borderRadius="8px" className="section-title" />
          <Skeleton width="60%" height="1.1rem" borderRadius="8px" className="section-subtitle" style={{ marginTop: '0.8rem' }} />
        </div>

        <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="featured-card">
              <div className="image-wrapper" style={{ height: '300px', borderRadius: '24px', overflow: 'hidden' }}>
                <Skeleton width="100%" height="100%" borderRadius="0" />
              </div>
              <div className="content" style={{ padding: '1.5rem' }}>
                <Skeleton width="70%" height="1.5rem" borderRadius="8px" />
                <Skeleton width="40%" height="1.1rem" borderRadius="8px" style={{ marginTop: '0.5rem' }} />
                <Skeleton width="50%" height="1.3rem" borderRadius="8px" style={{ marginTop: '0.8rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSkeleton;
