import { Schema, model, InferSchemaType, models } from "mongoose";

const houseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  images: { type: [String], default: [] },
  available: { type: Boolean, default: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  telephone: { type: String, required: true }, // Added telephone
  amenities: { type: [String], default: [] },
});

export type Ihouse = InferSchemaType<typeof houseSchema>;

export default models.house || model("house", houseSchema);
