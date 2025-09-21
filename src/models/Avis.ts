import { Schema, model, InferSchemaType, models } from "mongoose";

const avisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user" },
  maisonId: { type: Schema.Types.ObjectId, ref: "maison" },
  comment: String,
  rating: Number,
  datePosted: { type: Date, default: Date.now },
});

export type IAvis = InferSchemaType<typeof avisSchema>;

export default models.avis || model("avis", avisSchema);
