"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient"; // Make sure this path is correct
import { Button } from "@chakra-ui/react";

export default function AddMaisonPage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    pricePerDay: "",
    telephone: "", // <-- Add this line
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

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
      const filePath = `maisons/${Date.now()}_${safeName}`;
      try {
        const { data, error } = await supabase.storage
          .from("maison-images")
          .upload(filePath, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("maison-images")
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

      const maisonData = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        images: imageUrls,
      };

      const res = await fetch("/api/set-maison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          maisonData,
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
          telephone: "", // <-- Reset telephone
        });
        setImages(null);
      } else {
        Swal.fire("Error", data.message || "Failed to add maison", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-maison-page">
      <h2>Add Maison</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        <input
          name="pricePerDay"
          placeholder="Price Per Day"
          type="number"
          value={form.pricePerDay}
          onChange={handleChange}
          required
        />
        <input
          name="telephone"
          placeholder="Telephone"
          type="tel"
          pattern="[0-9]+"
          inputMode="numeric"
          value={form.telephone}
          onChange={handleChange}
          required
        />
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          required
        />
        <Button type="submit" className="btn" disabled={loading}>
          {loading ? "Adding..." : "Add Maison"}
        </Button>
      </form>
    </div>
  );
}
