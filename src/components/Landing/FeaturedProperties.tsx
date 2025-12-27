import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

import { useTranslations } from "next-intl";

import { IHouseListing } from "../HousesView/HousesView";

interface FeaturedPropertiesProps {
  houses: IHouseListing[];
}

export default function FeaturedProperties({ houses }: FeaturedPropertiesProps) {
  const t = useTranslations('Featured');

  if (!houses || houses.length === 0) return null;

  return (
    <section className="featured-properties-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        <div className="featured-grid">
          {houses.slice(0, 3).map((house) => (
            <Link 
              href={`/${house._id}`} 
              key={house._id} 
              className="featured-card"
            >
              <div className="image-wrapper">
                {house.images && house.images.length > 0 ? (
                  <Image 
                    src={house.images[0]} 
                    alt={house.title} 
                    fill 
                    className="house-img"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="no-image-placeholder" style={{ width: '100%', height: '100%', background: '#e2e8f0' }}></div>
                )}
                <div className="rating-badge">
                  <span className="star">★</span>
                  <span>{house.rating ? house.rating.toFixed(1) : t('new')}</span>
                </div>
              </div>
              
              <div className="content">
                <h3 className="house-title">{house.title}</h3>
                <div className="location">📍 {house.location}</div>
                <div className="price">
                  {house.pricePerDay} {t('currency')}
                  <span className="period"> {t('night')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/?view=list" className="btn" style={{ width: 'fit-content', margin: '0 auto' }}>
            {t('viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
