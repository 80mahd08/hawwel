import { Schema, model, InferSchemaType, models } from "mongoose";

const favoriSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user" },
  maisonId: { type: Schema.Types.ObjectId, ref: "maison" },
  dateAdded: { type: Date, default: Date.now },
});

export type IFavori = InferSchemaType<typeof favoriSchema>;

export default models.favori || model("favori", favoriSchema);
