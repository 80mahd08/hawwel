"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useUser } from "@clerk/nextjs";
import ChatWindow from "@/components/Chat/ChatWindow";
import ConversationList from "@/components/Chat/ConversationList";
import { MessageSquare, X } from "lucide-react";

export default function ChatWidget() {
  const { user } = useUser();
  const { isOpen, setIsOpen, activeConversation, setActiveConversation, unreadConversations } = useChat();
  const [showList, setShowList] = useState(false);

  if (!user) return null;

  const hasUnread = unreadConversations.length > 0;

  return (
    <div className="chat-widget-container" style={{
      position: 'fixed',
      bottom: '20px',
      right: '23px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px'
    }}>
      {/* Active Chat Window */}
      {isOpen && activeConversation && (
        <ChatWindow 
          conversationId={activeConversation} 
          onClose={() => setActiveConversation(null)} 
        />
      )}

      {/* Conversation List Dropup */}
      {showList && (
        <ConversationList 
          onSelect={(id) => {
            setActiveConversation(id);
            setIsOpen(true);
            setShowList(false);
          }} 
        />
      )}

      {/* Notification Message (Only if unread and not looking at the list) */}
      {hasUnread && !showList && !isOpen && (
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          animation: 'bounce 2s infinite',
          zIndex: 1001
        }}>
          New Message!
        </div>
      )}

      {/* Main Toggle Button */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowList(!showList)}
          className="chat-toggle-btn"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {showList ? <X size={28} /> : <MessageSquare size={28} />}
        </button>

        {/* Red Badge */}
        {hasUnread && !showList && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#ef4444',
            color: 'white',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {unreadConversations.length}
          </div>
        )}
      </div>
    </div>
  );
}
