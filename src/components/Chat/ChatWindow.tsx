"use client";

import React, { useEffect, useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Send, X, Loader2 } from "lucide-react";

interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ChatWindow({ conversationId, onClose }: { conversationId: string, onClose: () => void }) {
  const { socket, mongoId, markAsRead } = useChat();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !conversationId || !mongoId) return;

    // Mark as read in local state and database
    markAsRead(conversationId);
    fetch("/api/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(err => console.debug("Failed to mark as read", err));

    // Join room
    socket.emit("join-room", conversationId);

    // Fetch history
    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch(err => console.debug("Chat history error", err))
      .finally(() => setLoading(false));

    // Listen for new messages
    const handleMessage = (msg: IMessage) => {
      if (String(msg.conversationId) === String(conversationId)) {
        setMessages((prev) => {
          if (prev.some(m => String(m._id) === String(msg._id))) return prev;
          return [...prev, msg];
        });

        // --- REAL-TIME READ SYNC ---
        // If we are looking at this message, tell the DB we've read it
        if (String(msg.senderId) !== String(mongoId)) {
          fetch("/api/chat/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId }),
          }).catch(() => {});
        }
      }
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [conversationId, socket, markAsRead, mongoId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket?.connected) {
      return;
    }

    socket.emit("send-message", {
      conversationId,
      senderId: mongoId,
      content: input,
    });

    setInput("");
  };

  return (
    <div className="chat-window" style={{
      width: '320px',
      height: '450px',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid var(--glass-border)',
      color: 'var(--text)'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 15px', 
        backgroundColor: 'var(--primary-color)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 600, color: 'white' }}>Chat</span>
        <X size={18} style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 className="animate-spin" size={24} color="#888" />
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = String(msg.senderId) === String(mongoId);
            return (
              <div key={i} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? 'var(--primary-color)' : 'var(--btn-secondary-bg)',
                color: isMe ? 'white' : 'var(--text)',
                padding: '8px 12px',
                borderRadius: '16px',
                maxWidth: '80%',
                fontSize: '0.9rem'
              }}>
                {msg.content}
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ padding: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '8px 15px',
            outline: 'none',
            fontSize: '0.9rem',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text)'
          }}
        />
        <button type="submit" style={{
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '35px',
          height: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <Send size={16} color="white" />
        </button>
      </form>
    </div>
  );
}
