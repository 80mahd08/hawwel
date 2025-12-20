"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import StarRating from "./StarRating";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name?: string;
  imageUrl?: string;
}

interface Review {
  _id: string;
  userId: User;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  houseId: string;
  reviews: Review[];
  currentUser: any; 
  canReview: boolean;
}

export default function ReviewsSection({ houseId, reviews: initialReviews, currentUser, canReview }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      Swal.fire("Rating Required", "Please select a star rating", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId,
          userId: currentUser._id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Optimistically update or re-fetch. Since we have the new review data:
        const userId = currentUser._id;
        const newReview: Review = {
          _id: data.review._id,
          userId: {
            _id: userId,
            name: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`.trim(),
            imageUrl: currentUser.imageUrl,
          },
          rating: data.review.rating,
          comment: data.review.comment,
          createdAt: data.review.createdAt,
        };
        
        setReviews([newReview, ...reviews]);
        setRating(0);
        setComment("");
        Swal.fire("Success", "Review submitted!", "success");
        router.refresh(); // Refresh page to update average rating in header
      } else {
        Swal.fire("Error", data.message || "Failed to submit review", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header-block">
        <h3>Guest Reviews</h3>
        <span className="review-count">{reviews.length} reviews</span>
      </div>
      
      {/* Review Form - Only if eligible */}
      {currentUser && canReview ? (
        <div className="review-form-container">
          <h4>Share your experience</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-content">
               <div className="user-preview">
                 {currentUser.imageUrl ? (
                   <img src={currentUser.imageUrl} alt="You" />
                 ) : (
                   <div className="avatar-placeholder">{currentUser.firstName?.[0]}</div>
                 )}
               </div>
               <div className="input-area">
                 <div className="rating-select">
                   <StarRating rating={rating} onRatingChange={setRating} interactive size={24} />
                   <span className="rating-label">{rating > 0 ? "Thanks!" : "Rate your stay"}</span>
                 </div>
                 <textarea
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="How was your stay? What did you like best?"
                   required
                   rows={3}
                 />
               </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? "Publishing..." : "Post Review"}
              </button>
            </div>
          </form>
        </div>
      ) : !currentUser ? (
        <div className="auth-prompt">
          <p>Login to see if you can review this property.</p>
        </div>
      ) : null}

      {/* Reviews List */}
      <div className="reviews-grid">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div className="reviewer-profile">
                   {review.userId.imageUrl ? (
                     <img src={review.userId.imageUrl} alt="Reviewer" className="reviewer-avatar" />
                   ) : (
                     <div className="reviewer-avatar-placeholder">
                       {review.userId.name ? review.userId.name.charAt(0).toUpperCase() : "?"}
                     </div>
                   )}
                   <div className="reviewer-meta">
                     <span className="name">{review.userId.name || "Guest"}</span>
                     <span className="date">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                   </div>
                </div>
                {/* Optional: Show stars in card too if desired, usually top right or below name */}
              </div>
              
              <div className="review-rating-display">
                 <StarRating rating={review.rating} size={14} />
              </div>

              <div className="review-body">
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-reviews">
            <span className="icon">💬</span>
            <p>No reviews yet. Establish trust by being transparent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
