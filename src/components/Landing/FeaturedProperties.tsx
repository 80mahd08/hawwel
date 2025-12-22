import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

import { useTranslations } from "next-intl";

import { IHouseListing } from "../HousesView/HousesView";

interface FeaturedPropertiesProps {
  houses: IHouseListing[];
}

export default function FeaturedProperties({ houses }: FeaturedPropertiesProps) {
  const t = useTranslations('FeaturedProperties');

  if (!houses || houses.length === 0) return null;

  return (
    <section className="featured-properties">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('title')}</h2>
          <Link href="/?view=list" className="view-all">
            {t('viewAll')} →
          </Link>
        </div>

        <div className="properties-grid">
          {houses.slice(0, 3).map((house) => (
            <Link 
              href={`/house/${house._id}`} 
              key={house._id} 
              className="featured-card"
            >
              <div className="card-image">
                {house.images && house.images.length > 0 ? (
                  <Image 
                    src={house.images[0]} 
                    alt={house.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    unoptimized={true}
                  />
                ) : (
                  <div className="image-placeholder">No Image Available</div>
                )}
                <div className="price-tag">
                  {house.pricePerDay} {t('currency')}/{t('night')}
                </div>
              </div>
              <div className="card-content">
                <h3>{house.title}</h3>
                <p className="location">📍 {house.location}</p>
                <div className="card-footer">
                  <span className="rating">⭐ {house.rating ? house.rating.toFixed(1) : t('new')}</span>
                  <span className="book-now">{t('bookNow')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
