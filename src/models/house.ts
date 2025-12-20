import { Schema, model, InferSchemaType, models } from "mongoose";

const houseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true, index: true },
  pricePerDay: { type: Number, required: true, index: true },
  images: { type: [String], default: [] },
  available: { type: Boolean, default: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
  telephone: { type: String, required: true },
  amenities: { type: [String], default: [] },
  propertyType: {
    type: String,
    enum: ["Studio", "Apartment", "House", "Villa", "Townhouse", "Cottage"],
    required: false,
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  lat: { type: Number },
  lng: { type: Number },
  location_geo: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

export type Ihouse = InferSchemaType<typeof houseSchema>;

export default models.house || model("house", houseSchema);
