import React from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import StarRating from "../StarRating";
import { useTranslations } from "next-intl";
import { IReview } from "@/models/Review";
import { IUser } from "@/models/User";
import { Ihouse } from "@/models/house";

interface RecentReviewsProps {
  reviews: (IReview & { _id: string; userId?: IUser; houseId?: Ihouse & { _id: string } })[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  const t = useTranslations('Reviews');
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="recent-reviews-section">
      <div className="container">
        <h2 className="section-title">{t('title')}</h2>
        <p className="section-subtitle">{t('subtitle')}</p>

        <div className="recent-reviews-grid">
          {reviews.map((review) => (
            <div key={review._id} className="recent-review-card">
              <div className="card-header">
                <div className="user-info">
                  {review.userId?.imageUrl ? (
                    <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                      <NextImage 
                        src={review.userId.imageUrl} 
                        alt={review.userId.name || "User"} 
                        fill
                        sizes="40px"
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="avatar-placeholder">
                      {review.userId && review.userId.name ? review.userId.name[0].toUpperCase() : "?"}
                    </div>
                  )}
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
                <p>&ldquo;{review.comment}&rdquo;</p>
              </div>

              {review.houseId && (
                <Link href={`/${review.houseId._id}`} className="property-link">
                  <div className="property-thumb" style={{ position: 'relative', width: '80px', height: '60px' }}>
                    {review.houseId.images?.[0] && (
                      <NextImage 
                        src={review.houseId.images[0]} 
                        alt="" 
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                  <div className="property-info">
                    <span className="stay-at">{t('stayedAt')}</span>
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
