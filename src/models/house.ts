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
});

export type Ihouse = InferSchemaType<typeof houseSchema>;

export default models.house || model("house", houseSchema);
