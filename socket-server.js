/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.CHAT_PORT || 3001;

if (!MONGODB_URI) {
  process.exit(1);
}

// Reuse Mongoose models (CommonJS version for the external server)
const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  lastMessage: String,
  unreadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  content: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this for production
    methods: ["GET", "POST"],
  },
});

mongoose.connect(MONGODB_URI);

io.on("connection", (socket) => {

  // 1. Identify User & Join Personal Room
  socket.on("identify", (userId, callback) => {
    socket.join(userId);
    // Acknowledge connectivity to client
    if (callback) callback({ status: "ok", userId });
  });

  // 2. Join Specific Conversation Room
  socket.on("join-room", (conversationId, callback) => {
    socket.join(conversationId);
    if (callback) callback({ status: "joined", room: conversationId });
  });

  // 3. Send Message Handler
  socket.on("send-message", async (data, callback) => {
    const { conversationId, senderId, content } = data;
    
    try {
      // DB Operations
      const newMessage = new Message({ conversationId, senderId, content });
      await newMessage.save();

      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.lastMessage = content;
        conversation.updatedAt = new Date();
        
        // Update unreadBy list
        if (!conversation.unreadBy) conversation.unreadBy = [];
        const others = conversation.participants.filter(p => p.toString() !== senderId.toString());
        const currentUnread = new Set(conversation.unreadBy.map(u => u.toString()));
        currentUnread.delete(senderId.toString());
        others.forEach(o => currentUnread.add(o.toString()));
        conversation.unreadBy = Array.from(currentUnread);
        
        await conversation.save();
      }

      const messagePayload = {
        _id: newMessage._id,
        conversationId,
        senderId,
        content,
        createdAt: newMessage.createdAt,
      };

      // Broadcast to room
      io.to(conversationId).emit("receive-message", messagePayload);

      // Broadcast to personal rooms (for notifications)
      if (conversation && conversation.participants) {
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("receive-message", messagePayload);
        });
      }

      // Acknowledge success to sender
      if (callback) callback({ status: "sent", messageId: newMessage._id });
      
    } catch (error) {
      if (callback) callback({ status: "error", error: error.message });
    }
  });

  // --- Real-time Booking Notifications ---

  socket.on("booking-request", (data) => {
    const { ownerId, pending } = data;
    io.to(ownerId).emit("receive-booking-request", pending);
  });

  socket.on("booking-status-update", (data) => {
    const { buyerId, pending } = data;
    io.to(buyerId).emit("receive-booking-status-update", pending);
  });

  socket.on("booking-cleared", (data) => {
    const { userId, pendingId } = data;
    io.to(userId).emit("receive-booking-cleared", pendingId);
  });

  socket.on("disconnect", () => {
  });
});

httpServer.listen(PORT);
