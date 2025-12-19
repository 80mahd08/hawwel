"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

export default function AddHousePage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pricePerDay: "",
    telephone: "",
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

      const houseData = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        images: imageUrls,
        amenities,
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
        });
        setImages(null);
        setAmenities([]);
      } else {
        Swal.fire("Error", data.message || "Failed to add house", "error");
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
            placeholder="Describe the key features and amenities..."
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              placeholder="e.g. Sidi Bou Said"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
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
