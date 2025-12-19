"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

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
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    selectedAmenities.forEach((a) => params.append("amenities", a));

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="search-filter-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="filter-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="City or Neighborhood"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Price Range (DT)</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Dates</label>
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group full-width">
          <label>Amenities</label>
          <div className="amenities-list">
            {allAmenities.map((amenity) => (
              <label key={amenity} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn search-btn">
          Search
        </button>
      </form>
    </div>
  );
}
