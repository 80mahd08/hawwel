import React from 'react';

export default function Loading() {
  return (
    <div className="container" style={{ padding: "80px 1rem" }}>
      {/* Title Skeleton */}
      <div className="skeleton" style={{ width: "200px", height: "40px", marginBottom: "30px" }} />
      
      {/* Filters Skeleton */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "40px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ width: "100px", height: "36px", borderRadius: "10px" }} />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "2rem" 
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color, #eee)" }}>
            <div className="skeleton" style={{ height: "240px", width: "100%" }} />
            <div style={{ padding: "1.5rem" }}>
              <div className="skeleton" style={{ width: "70%", height: "24px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "40%", height: "16px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "30%", height: "20px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
