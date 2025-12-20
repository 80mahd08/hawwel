"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Custom marker for "Price Pins"
// Custom marker for "Price Pins"
const createPriceIcon = (price: number, rating?: number) => {
  const ratingHtml = rating ? `<span class="marker-rating">★ ${rating.toFixed(1)}</span>` : '';
  return L.divIcon({
    className: "custom-price-marker-wrapper",
    html: `<div class="custom-price-marker">${ratingHtml}<span>DT ${price}</span></div>`,
    iconSize: [rating ? 100 : 80, 42], // Wider if rating exists
    iconAnchor: [rating ? 50 : 40, 42],
  });
};

interface MapViewProps {
  houses: any[];
}

export default function MapView({ houses }: MapViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark-theme"));
    };
    checkTheme();

    // Observe theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  console.log("MapView: Rendering with houses:", houses);
  const mapWithCoords = houses.filter(h => h.lat != null && h.lng != null);

  // Center map logic
  const defaultCenter: [number, number] = [36.8065, 10.1815];
  const center = mapWithCoords.length > 0 
    ? [mapWithCoords[0].lat, mapWithCoords[0].lng] as [number, number]
    : defaultCenter;

  const ChangeView = ({ houses }: { houses: any[] }) => {
    const map = useMap();
    useEffect(() => {
      const validHouses = houses.filter(h => h.lat != null && h.lng != null);
      if (validHouses.length > 0) {
        const bounds = L.latLngBounds(validHouses.map(h => [h.lat, h.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView(defaultCenter, 6);
      }
    }, [houses, map]);
    return null;
  };

  const tileLayerUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="map-view-container" style={{ height: "600px", width: "100%", borderRadius: "20px", overflow: "hidden", margin: "20px 0" }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileLayerUrl}
        />
        <ChangeView houses={houses} />
        {mapWithCoords.map((house) => (
          <Marker 
            key={house._id} 
            position={[house.lat, house.lng]} 
            icon={createPriceIcon(house.pricePerDay, house.rating)}
          >
            <Popup className="house-map-popup">
              <div className="popup-inner">
                {house.images?.[0] && (
                  <div style={{ position: "relative", height: "140px", width: "100%" }}>
                    <Image 
                      src={house.images[0]} 
                      alt={house.title} 
                      fill 
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className="popup-text">
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "var(--text)", fontWeight: "700" }}>{house.title}</h4>
                  <p style={{ margin: "0 0 12px 0", color: "var(--text-light)", fontSize: "0.9rem" }}>📍 {house.location}</p>
                  <p style={{ margin: "0 0 12px 0", color: "var(--title)", fontWeight: "800", fontSize: "1rem" }}>DT {house.pricePerDay} / day</p>
                  <Link href={`/${house._id}`} className="popup-btn">
                    View Property
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .custom-price-marker-wrapper {
          border: none;
          background: none;
        }
        
        .custom-price-marker {
          background: var(--card-bg);
          color: var(--text);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 800;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
          padding: 6px 14px;
          border: 2px solid var(--border-color);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
        }

        .custom-price-marker::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid var(--border-color);
        }

        .custom-price-marker:hover {
          transform: translateX(-50%) scale(1.1);
          background: var(--title);
          color: white;
          border-color: var(--title);
          z-index: 1000 !important;
        }

        .custom-price-marker:hover::after {
          border-top-color: var(--title);
        }

        .marker-rating {
          color: #fbbf24;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .house-map-popup .leaflet-popup-content-wrapper {
          background: var(--card-bg);
          color: var(--text);
          border-radius: 16px;
          padding: 0;
          box-shadow: var(--shadow-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .house-map-popup .leaflet-popup-tip {
          background: var(--card-bg);
        }
        
        .house-map-popup .leaflet-popup-content {
          margin: 0;
          width: 250px !important;
        }

        .popup-inner {
          padding: 0;
        }

        .popup-text {
          padding: 16px;
        }

        .popup-btn {
          display: block;
          width: 100%;
          padding: 12px 10px;
          background: var(--title);
          color: #ffffff !important;
          text-align: center;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(28, 115, 161, 0.2);
          border: none;
          cursor: pointer;
        }

        .popup-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(28, 115, 161, 0.35);
          filter: brightness(1.1);
        }

        .popup-btn:active {
          transform: translateY(0);
          filter: brightness(0.95);
        }

        .house-map-popup .leaflet-popup-close-button {
          color: var(--text) !important;
          font-size: 1.5rem !important;
          right: 10px !important;
          top: 10px !important;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
