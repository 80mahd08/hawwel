"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";
import { useTranslations } from "next-intl";

const LocationPicker = dynamic(() => import("@/components/LocationPicker/LocationPicker"), { ssr: false });

export default function AddHousePage() {
  const { user } = useUser();
  const t = useTranslations('AddHouse');
  const tSearch = useTranslations('Search');
  
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
        await supabase.storage
          .from("house-images")
          .upload(filePath, file);

        const { data: publicUrlData } = supabase.storage
          .from("house-images")
          .getPublicUrl(filePath);

        urls.push(publicUrlData.publicUrl);
      } catch (err) {
        throw err;
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
        Swal.fire(t('locationRequired'), t('locationMsg'), "warning");
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
        Swal.fire(t('successTitle'), t('successMsg'), "success");
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
        Swal.fire(t('errorTitle'), errorDetails || "Failed to add house", "error");
      }
    } catch {
      Swal.fire(t('errorTitle'), "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-house-page">
      <div className="form-header">
        <h2>{t('title')}</h2>
        <p>{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group full-width">
          <label htmlFor="title">{t('propertyTitle')}</label>
          <input
            id="title"
            name="title"
            placeholder={t('titlePlaceholder')}
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">{t('description')}</label>
          <textarea
            id="description"
            name="description"
            placeholder={t('descPlaceholder')}
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="pricePerDay">{t('priceLabel')}</label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            placeholder={t('pricePlaceholder')}
            type="number"
            value={form.pricePerDay}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="propertyType">{t('propertyType')}</label>
          <select
            id="propertyType"
            name="propertyType"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
            required
          >
            <option value="">{t('selectType')}</option>
            <option value="Studio">{tSearch('propertyTypes.Studio')}</option>
            <option value="Apartment">{tSearch('propertyTypes.Apartment')}</option>
            <option value="House">{tSearch('propertyTypes.House')}</option>
            <option value="Villa">{tSearch('propertyTypes.Villa')}</option>
            <option value="Townhouse">{tSearch('propertyTypes.Townhouse')}</option>
            <option value="Cottage">{tSearch('propertyTypes.Cottage')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="telephone">{t('contactNumber')}</label>
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
          <label>{t('pinLocation')}</label>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "-4px 0 8px 4px" }}>
            {t('pinHelp')}
          </p>
          <LocationPicker 
            onLocationSelect={(lat, lng, address) => {
              setForm(f => ({ ...f, lat, lng, location: address || f.location }));
            }} 
          />
          {form.lat && (
            <div style={{ fontSize: "0.85rem", color: "#1c73a1", marginTop: "8px" }}>
              📍 {t('coordinates')} {form.lat.toFixed(4)}, {form.lng?.toFixed(4)}
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label>{t('amenities')}</label>
          <div className="amenities-grid">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <span>{tSearch(`amenitiesList.${amenity.replace(/\s+/g, '')}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="images">{t('propertyImages')}</label>
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
              <span>{t('dragDrop')}</span>
              <small>{t('formats')}</small>
            </div>
          </div>
          {images && images.length > 0 && (
            <div className="file-preview-info">
              {t('selectedFiles', { count: images.length })}
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
             t('publishBtn')
          )}
        </button>
      </form>
    </div>
  );
}
