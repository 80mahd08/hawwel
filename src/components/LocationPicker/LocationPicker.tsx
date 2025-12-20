"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icon inclusion
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      try {
        // Reverse Geocoding using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        // Pick the most relevant location name (city, town, village, or neighborhood)
        const address = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.suburb || 
                        data.address.neighborhood || 
                        data.address.state || 
                        "";
        
        onLocationSelect(lat, lng, address);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        onLocationSelect(lat, lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export default function LocationPicker({ onLocationSelect, initialLat = 36.8065, initialLng = 10.1815 }: LocationPickerProps) {
  return (
    <div className="location-picker-container" style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #e2e8f0" }}>
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} initialLat={initialLat} initialLng={initialLng} />
      </MapContainer>
    </div>
  );
}
