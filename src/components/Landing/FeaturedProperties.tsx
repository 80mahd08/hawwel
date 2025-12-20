import React from "react";
import Link from "next/link";
import Image from "next/image";
import StarRating from "../StarRating";

interface FeaturedPropertiesProps {
  houses: any[];
}

export default function FeaturedProperties({ houses }: FeaturedPropertiesProps) {
  if (!houses || houses.length === 0) return null;

  return (
    <section className="featured-properties-section">
      <div className="container">
        <div className="section-header centered">
          <h2 className="section-title">Featured Homes</h2>
          <p className="section-subtitle">Top-rated stays loved by guests</p>
        </div>

        <div className="featured-grid">
          {houses.map((house) => (
            <Link href={`/${house._id}`} key={house._id} className="featured-card">
              <div className="image-wrapper">
                {house.images?.[0] ? (
                  <Image
                    src={house.images[0]}
                    alt={house.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="house-img"
                  />
                ) : (
                  <div className="placeholder-img" />
                )}
                <div className="rating-badge">
                  <span className="star">★</span>
                  <span>{house.rating?.toFixed(1) || "New"}</span>
                </div>
              </div>
              <div className="content">
                <h3 className="house-title">{house.title}</h3>
                <p className="location">📍 {house.location}</p>
                <div className="price">
                  <span className="amount">DT {house.pricePerDay}</span>
                  <span className="period">/ night</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
