import { Schema, model, InferSchemaType, models } from "mongoose";

const pendingSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
    index: true,
  },
  houseId: { type: Schema.Types.ObjectId, ref: "house", required: true, index: true },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  buyerArchived: { type: Boolean, default: false },
});

pendingSchema.index({ startDate: 1, endDate: 1 });

export type IPending = InferSchemaType<typeof pendingSchema>;

export default models.pending || model("pending", pendingSchema);
