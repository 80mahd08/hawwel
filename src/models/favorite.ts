import { Schema, model, InferSchemaType, models } from "mongoose";

const favoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user" },
  houseId: { type: Schema.Types.ObjectId, ref: "house" },
  dateAdded: { type: Date, default: Date.now },
});

export type Ifavorite = InferSchemaType<typeof favoriteSchema>;

export default models.favorite || model("favorite", favoriteSchema);
