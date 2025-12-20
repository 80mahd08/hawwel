"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

const LocationPicker = dynamic(() => import("@/components/LocationPicker/LocationPicker"), { ssr: false });

export default function AddHousePage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pricePerDay: "",
    telephone: "",
    propertyType: "",
    lat: null as number | null,
    lng: null as number | null,
  });
  console.log(form);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const [amenities, setAmenities] = useState<string[]>([]);

  const AMENITIES_LIST = [
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

  const handleAmenityChange = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "images" && files) {
      setImages(files);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadImagesToSupabase = async (files: FileList) => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Sanitize filename: keep only ASCII letters, numbers, dots, dashes, and underscores
      const safeName = file.name
        .replace(/[^a-zA-Z0-9.\-_]/g, "_")
        .replace(/_+/g, "_");
      const filePath = `houses/${Date.now()}_${safeName}`;
      try {
        const { data, error } = await supabase.storage
          .from("house-images")
          .upload(filePath, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("house-images")
          .getPublicUrl(filePath);
        console.log("Uploaded image URL:", publicUrlData.publicUrl);

        urls.push(publicUrlData.publicUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      }
    }
    return urls;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await uploadImagesToSupabase(images);
      }

      if (form.lat === null || form.lng === null) {
        Swal.fire("Location Required", "Please click on the map to pin your property's location.", "warning");
        setLoading(false);
        return;
      }

      const houseData = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        images: imageUrls,
        amenities,
        lat: form.lat,
        lng: form.lng,
      };

      const res = await fetch("/api/house/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          houseData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Maison added!", "success");
        setForm({
          title: "",
          description: "",
          location: "",
          pricePerDay: "",
          telephone: "",
          propertyType: "",
          lat: null,
          lng: null,
        });
        setImages(null);
        setAmenities([]);
      } else {
        const errorDetails = data.errors
          ? Object.entries(data.errors)
              .map(
                ([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`
              )
              .join("\n")
          : data.message;
        Swal.fire("Error", errorDetails || "Failed to add house", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-house-page">
      <div className="form-header">
        <h2>List Your Property</h2>
        <p>Fill in the details below to add your house to our listings.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group full-width">
          <label htmlFor="title">Property Title</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Luxury Villa in Tunis"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the key features of your property"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="pricePerDay">Price Per Day (DT)</label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            placeholder="0.00"
            type="number"
            value={form.pricePerDay}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="propertyType">Property Type *</label>
          <select
            id="propertyType"
            name="propertyType"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
            required
          >
            <option value="">Select property type...</option>
            <option value="Studio">Studio</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Cottage">Cottage</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Contact Number</label>
          <input
            id="telephone"
            name="telephone"
            placeholder="+216 00 000 000"
            type="tel"
            pattern="[0-9]+"
            inputMode="numeric"
            value={form.telephone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Pin Location on Map (Required)</label>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "-4px 0 8px 4px" }}>
            Click on the map to mark exactly where your property is located. This will automatically set the city.
          </p>
          <LocationPicker 
            onLocationSelect={(lat, lng, address) => {
              setForm(f => ({ ...f, lat, lng, location: address || f.location }));
            }} 
          />
          {form.lat && (
            <div style={{ fontSize: "0.85rem", color: "#1c73a1", marginTop: "8px" }}>
              📍 Coordinates set: {form.lat.toFixed(4)}, {form.lng?.toFixed(4)}
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label>Amenities</label>
          <div className="amenities-grid">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="images">Property Images</label>
          <div className="file-upload-wrapper">
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              required
              className="file-input"
            />
            <div className="file-upload-placeholder">
              <span>Drag & drop images here or click to browse</span>
              <small>Supported formats: JPG, PNG</small>
            </div>
          </div>
          {images && images.length > 0 && (
            <div className="file-preview-info">
              {images.length} file(s) selected
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            "Publish Listing"
          )}
        </button>
      </form>
    </div>
  );
}
