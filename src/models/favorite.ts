import { Schema, model, InferSchemaType, models } from "mongoose";

const favoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", index: true },
  houseId: { type: Schema.Types.ObjectId, ref: "house", index: true },
  dateAdded: { type: Date, default: Date.now },
});

favoriteSchema.index({ userId: 1, houseId: 1 }, { unique: true });

export type Ifavorite = InferSchemaType<typeof favoriteSchema>;

export default models.favorite || model("favorite", favoriteSchema);
