"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import RemFavBtn from "./components/RemFavBtn";
import FavBtn from "./components/FavBtn";
import RemHouseBtn from "./components/RemHouseBtn";

// ============================================
// Types
// ============================================
export type LinkHouseProps = {
  _id?: string;
  title: string;
  location: string;
  pricePerDay: number;
  images: string[];
  available: boolean;
  isAvailable?: boolean; // Add real-time availability
  rating?: number;
};

// ============================================
// Component
// ============================================
export default function LinkHouse({ house, index = 0 }: { house: LinkHouseProps, index?: number }) {
  const pathname = usePathname();
  const { user } = useUser();
  const t = useTranslations('HouseCard');

  const isFavoritePage = pathname.includes("/see-favorites");
  const hasImage = house.images.length > 0;

  // Use real-time availability if provided, otherwise fall back to stored availability
  const isHouseAvailable =
    house.isAvailable !== undefined ? house.isAvailable : house.available;

  return (
    <motion.div
      className={`house-link-container ${
        !isHouseAvailable ? "unavailable-house" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileHover={{ y: -8, scale: 1.02 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: "easeOut" 
      }}
    >
      <Link href={`/${house._id}`} className="house-link">
        {hasImage && (
          <div className="image">
            <Image
              src={house.images[0]}
              alt={house.title}
              className="house-image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
            <div className="rating-badge">
              <span className="star">★</span>
              <span>{house.rating ? house.rating.toFixed(1) : t('new')}</span>
            </div>
          </div>
        )}

        <div className="text">
          <h2>{house.title}</h2>
          <p>📍 {house.location}</p>
          <p className="price">
            <strong>{t('currency')} {house.pricePerDay}</strong> / {t('day')}
          </p>
          <p
            className="availability"
            style={{
              color: isHouseAvailable ? "#10b981" : "#ef4444",
            }}
          >
            {isHouseAvailable ? `● ${t('available')}` : `○ ${t('booked')}`}
          </p>
        </div>
      </Link>

      <div className="btn-container">
        {user?.id &&
          (isFavoritePage ? (
            <RemFavBtn houseId={house._id!} />
          ) : (
            <FavBtn houseId={house._id!} />
          ))}
        {pathname.includes("/my-houses") && <RemHouseBtn houseId={house._id!} />}
      </div>
    </motion.div>
  );
}
