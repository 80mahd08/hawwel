"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { MessageSquare, Loader2 } from "lucide-react";

export default function StartChatBtn({ participantId, label }: { participantId: string, label?: string }) {
  const { setActiveConversation, setIsOpen } = useChat();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setActiveConversation(data.conversationId);
        setIsOpen(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleStartChat}
      className="start-chat-btn"
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 500,
        marginTop: '10px'
      }}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} />}
      {label || "Chat"}
    </button>
  );
}
