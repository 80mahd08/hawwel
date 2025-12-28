"use client";

import React from "react";
import Skeleton from "./Skeleton";

const RecentReviewsSkeleton = () => {
  return (
    <section className="recent-reviews-section">
      <div className="container">
        <div className="section-header">
          <Skeleton width="30%" height="2.2rem" borderRadius="8px" className="section-title" />
          <Skeleton width="50%" height="1.1rem" borderRadius="8px" className="section-subtitle" style={{ marginTop: '0.8rem' }} />
        </div>

        <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="review-card" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <div className="review-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Skeleton circle width="48px" height="48px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height="1.1rem" borderRadius="4px" />
                  <Skeleton width="30%" height="0.9rem" borderRadius="4px" style={{ marginTop: '0.4rem' }} />
                </div>
              </div>
              <Skeleton width="100%" height="1rem" borderRadius="4px" />
              <Skeleton width="90%" height="1rem" borderRadius="4px" style={{ marginTop: '0.5rem' }} />
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="40px" height="40px" borderRadius="8px" />
                <Skeleton width="50%" height="1rem" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentReviewsSkeleton;
