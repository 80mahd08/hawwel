"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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
};

// ============================================
// Component
// ============================================
export default function LinkHouse({ house }: { house: LinkHouseProps }) {
  const pathname = usePathname();
  const { user } = useUser();

  const isFavoritePage = pathname === "/see-favorites";
  const hasImage = house.images.length > 0;

  // Use real-time availability if provided, otherwise fall back to stored availability
  const isHouseAvailable =
    house.isAvailable !== undefined ? house.isAvailable : house.available;

  return (
    <div
      className={`house-link-container ${
        !isHouseAvailable ? "unavailable-house" : ""
      }`}
    >
      <Link href={`/${house._id}`} className="house-link">
        <div className="text">
          <h2>{house.title}</h2>
          <p>{house.location}</p>
          <p className="price">
            <strong>DT {house.pricePerDay}</strong>
          </p>
          <p
            style={{
              color: isHouseAvailable ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {isHouseAvailable ? "Available" : "Unavailable"}
          </p>
        </div>

        {hasImage && (
          <div className="image">
            <Image
              src={house.images[0]}
              alt={house.title}
              className="house-image"
              width={500}
              height={300}
            />
          </div>
        )}
      </Link>

      <div className="btn-container">
        {user?.id &&
          (isFavoritePage ? (
            <RemFavBtn houseId={house._id!} />
          ) : (
            <FavBtn houseId={house._id!} />
          ))}
        {pathname === "/my-houses" && <RemHouseBtn houseId={house._id!} />}
      </div>
    </div>
  );
}
