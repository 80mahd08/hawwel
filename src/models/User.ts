import { Schema, model, InferSchemaType, models } from "mongoose";

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  role: {
    type: String,
    enum: ["USER", "OWNER"],
    default: "USER",
  },
});

export type IUser = InferSchemaType<typeof userSchema>;

export default models.user || model("user", userSchema);
