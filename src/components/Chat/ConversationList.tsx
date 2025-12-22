"use client";

import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { useUser } from "@clerk/nextjs";

import { useChat } from "@/context/ChatContext";

interface IParticipant {
  _id: string;
  name: string;
  imageUrl: string;
  clerkId: string;
}

interface IConversation {
  _id: string;
  participants: IParticipant[];
  lastMessage?: string;
  updatedAt: string;
}

export default function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { unreadConversations } = useChat();

  useEffect(() => {
    fetch("/api/chat/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="conversation-list-popup" style={{
      width: '300px',
      maxHeight: '400px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      overflowY: 'auto',
      border: '1px solid #eaeaea'
    }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>
        Messages
      </div>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No messages yet</div>
      ) : (
        conversations.map((conv) => {
          const otherParticipant = conv.participants.find((p) => p.clerkId !== user?.id);
          const isUnread = unreadConversations.some(id => String(id) === String(conv._id));

          return (
            <div 
              key={conv._id} 
              onClick={() => onSelect(conv._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 15px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderBottom: '1px solid #f9f9f9',
                backgroundColor: isUnread ? '#f0f7ff' : 'transparent'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isUnread ? '#e6f0ff' : '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isUnread ? '#f0f7ff' : 'transparent')}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                  <NextImage 
                    src={otherParticipant?.imageUrl || "/placeholder-avatar.png"} 
                    alt={otherParticipant?.name || "User"}
                    fill
                    sizes="40px"
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
                {isUnread && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#0070f3',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: isUnread ? 700 : 600, fontSize: '0.9rem' }}>{otherParticipant?.name}</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: isUnread ? '#0070f3' : '#666', 
                  fontWeight: isUnread ? 600 : 400,
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {conv.lastMessage || "Start a conversation"}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
