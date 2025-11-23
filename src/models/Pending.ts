import { Schema, model, InferSchemaType, models } from "mongoose";

const pendingSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
  },
  houseId: { type: Schema.Types.ObjectId, ref: "house", required: true },
  createdAt: { type: Date, default: Date.now },
});

export type IPending = InferSchemaType<typeof pendingSchema>;

export default models.pending || model("pending", pendingSchema);
