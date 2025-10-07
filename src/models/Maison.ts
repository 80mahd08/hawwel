import { Schema, model, InferSchemaType, models } from "mongoose";

const maisonSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  images: { type: [String], default: [] },

  ownerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  telephone: { type: String, required: true }, // Added telephone
});

export type IMaison = InferSchemaType<typeof maisonSchema>;

export default models.maison || model("maison", maisonSchema);
