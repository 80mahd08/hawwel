import { Schema, model, InferSchemaType, models } from "mongoose";

const pendingSchema = new Schema({
  maisonId: { type: Schema.Types.ObjectId, ref: "maison", required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export type IPending = InferSchemaType<typeof pendingSchema>;

export default models.pending || model("pending", pendingSchema);
