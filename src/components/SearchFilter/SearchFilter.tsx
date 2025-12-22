"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Search');

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [onlyAvailable, setOnlyAvailable] = useState(
    searchParams.get("onlyAvailable") === "true"
  );
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    searchParams.getAll("propertyType") || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const allAmenities = [
    "Wifi",
    "Air Conditioning",
    "Pool",
    "Parking",
    "Kitchen",
    "TV",
    "Heating",
    "Washer",
    "Dryer",
    "Iron",
    "Hair Dryer",
    "Workspace",
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.getAll("amenities") || []
  );

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (location) params.set("location", location);
    else params.delete("location");
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    if (onlyAvailable) params.set("onlyAvailable", "true");
    else params.delete("onlyAvailable");

    params.delete("propertyType");
    selectedPropertyTypes.forEach((type) => params.append("propertyType", type));

    if (sortBy) params.set("sortBy", sortBy);
    else params.delete("sortBy");

    params.delete("amenities");
    selectedAmenities.forEach((a) => params.append("amenities", a));

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="search-filter-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="filter-group">
          <label>{t('location')}</label>
          <input
            type="text"
            placeholder={t('locationPlaceholder')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>{t('priceRange')}</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder={t('min')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder={t('max')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>{t('dates')}</label>
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>{t('to')}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>{t('sortBy')}</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="">{t('sort.newest')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
            <option value="rating-desc">{t('sort.ratingDesc')}</option>
            <option value="newest">{t('sort.newest')}</option>
          </select>
        </div>

        <div className="filter-group full-width">
          <label>{t('propertyType')}</label>
          <div className="amenities-list">
            {["Studio", "Apartment", "House", "Villa", "Townhouse", "Cottage"].map((type) => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPropertyTypes.includes(type)}
                  onChange={() => setSelectedPropertyTypes((prev) =>
                    prev.includes(type)
                      ? prev.filter((t) => t !== type)
                      : [...prev, type]
                  )}
                />
                {t(`propertyTypes.${type}`)}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>{t('availability')}</label>
          <label className="checkbox-label availability-toggle">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            <span className="live-dot"></span>
            {t('availableNow')}
          </label>
        </div>

        <div className="filter-group full-width">
          <label>{t('amenities')}</label>
          <div className="amenities-list">
            {allAmenities.map((amenity) => (
              <label key={amenity} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                {t(`amenitiesList.${amenity.replace(/\s+/g, '')}`)}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn search-btn">
          {t('searchBtn')}
        </button>
      </form>
    </div>
  );
}
