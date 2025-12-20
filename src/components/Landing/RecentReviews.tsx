import React from "react";
import Link from "next/link";
import StarRating from "../StarRating";

interface RecentReviewsProps {
  reviews: any[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="recent-reviews-section">
      <div className="container">
        <h2 className="section-title">What Guests Are Saying</h2>
        <p className="section-subtitle">Real experiences from real travelers</p>

        <div className="recent-reviews-grid">
          {reviews.map((review) => (
            <div key={review._id} className="recent-review-card">
              <div className="card-header">
                <div className="user-info">
                  {/* Since User model only has name and no image, use placeholder for now */}
                  <div className="avatar-placeholder">
                    {review.userId?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="user-name">
                      {review.userId?.name || "Anonymous Guest"}
                    </p>
                    <p className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>

              <div className="card-body">
                <p>"{review.comment}"</p>
              </div>

              {review.houseId && (
                <Link href={`/${review.houseId._id}`} className="property-link">
                  <div className="property-thumb">
                    {review.houseId.images?.[0] && (
                      <img src={review.houseId.images[0]} alt="" />
                    )}
                  </div>
                  <div className="property-info">
                    <span className="stay-at">Stayed at</span>
                    <span className="property-title">{review.houseId.title}</span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
