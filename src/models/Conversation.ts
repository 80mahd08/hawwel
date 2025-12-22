import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  unreadBy: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "user", required: true },
    ],
    lastMessage: { type: String },
    unreadBy: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

// Index participants for fast lookup
ConversationSchema.index({ participants: 1 });

export default models.Conversation || model("Conversation", ConversationSchema);
