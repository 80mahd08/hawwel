import { Schema, model, models, InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    houseId: { type: Schema.Types.ObjectId, ref: "house", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export type IReview = InferSchemaType<typeof reviewSchema>;

export default models.Review || model("Review", reviewSchema);
