import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Message || model("Message", MessageSchema);
