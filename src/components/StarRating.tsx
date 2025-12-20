"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  size = 20,
  interactive = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        
        return (
          <span
            key={index}
            style={{
              cursor: interactive ? "pointer" : "default",
              fontSize: `${size}px`,
              color: isFilled ? "#FFD700" : "#D1D5DB", // Gold for filled, Gray for empty
              transition: "color 0.2s",
            }}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
