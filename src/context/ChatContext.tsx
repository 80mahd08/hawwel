"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Swal from "sweetalert2";

interface ChatContextType {
  socket: Socket | null;
  mongoId: string | null;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadConversations: string[];
  markAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  mongoId: null,
  activeConversation: null,
  setActiveConversation: () => {},
  isOpen: false,
  setIsOpen: () => {},
  unreadConversations: [],
  markAsRead: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<string[]>([]);

  // 1. Singleton Socket Initialization
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL;
    
    if (!socketUrl) {
      console.warn("NEXT_PUBLIC_CHAT_SERVER_URL is not defined. Chat functionality will be disabled.");
      return;
    }

    // Create new socket instance
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    setSocket(newSocket);

    // Initial Data Fetching
    Promise.all([
      fetch("/api/user/me").then(res => res.json()),
      fetch("/api/chat/conversations").then(res => res.json())
    ]).then(([userData, chatData]) => {
      const currentMongoId = userData.user?._id;
      if (currentMongoId) {
        setMongoId(currentMongoId);
        
        // Calculate unread status
        const unreadIds = (chatData.conversations || [])
          .filter((conv: { unreadBy?: string[] }) => {
            return conv.unreadBy?.some((uid) => String(uid) === String(currentMongoId));
          })
          .map((conv: { _id: string }) => conv._id);
        
        setUnreadConversations(unreadIds);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 2. Identification & Global Listeners (Re-run when socket/mongoId changes)
  useEffect(() => {
    if (!socket || !mongoId) return;

    // Robust Identity Handler
    const handleIdentify = () => {
      if (!socket.connected) return;
      
      socket.emit("identify", mongoId);
    };

    // Listeners
    socket.on("connect", handleIdentify);
    socket.on("reconnect", handleIdentify);

    // Initial attempt if already connected
    if (socket.connected) handleIdentify();

    // -- Message Listeners --
    socket.on("receive-message", (msg) => {
      
      const isFromMe = String(msg.senderId) === String(mongoId);
      const isCurrentConversation = isOpen && String(msg.conversationId) === String(activeConversation);

      if (!isCurrentConversation && !isFromMe) {
        setUnreadConversations((prev) => {
          if (prev.includes(msg.conversationId)) return prev;
          return [...prev, msg.conversationId];
        });
      }
    });

    // -- Booking Listeners --
    const triggerRefresh = () => window.dispatchEvent(new Event("refresh-booking-data"));

    socket.on("receive-booking-request", (pending) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'New Booking Request!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      triggerRefresh();
    });

    socket.on("receive-booking-status-update", (pending) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: pending.status === 'approved' ? 'success' : 'warning',
        title: `Booking ${pending.status}!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      triggerRefresh();
    });

    socket.on("receive-booking-cleared", () => triggerRefresh());

    return () => {
      socket.off("connect", handleIdentify);
      socket.off("reconnect", handleIdentify);
      socket.off("receive-message");
      socket.off("receive-booking-request");
      socket.off("receive-booking-status-update");
      socket.off("receive-booking-cleared");
    };
  }, [socket, mongoId, isOpen, activeConversation]);

  const handleSetActiveConversation = React.useCallback((id: string | null) => {
    setActiveConversation(id);
  }, []);

  const handleSetIsOpen = React.useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const markAsRead = React.useCallback((conversationId: string) => {
    setUnreadConversations((prev) => prev.filter((id) => id !== conversationId));
  }, []);

  const contextValue = React.useMemo(() => ({
    socket,
    mongoId,
    activeConversation,
    setActiveConversation: handleSetActiveConversation,
    isOpen,
    setIsOpen: handleSetIsOpen,
    unreadConversations,
    markAsRead,
  }), [
    socket, 
    mongoId, 
    activeConversation, 
    handleSetActiveConversation, 
    isOpen, 
    handleSetIsOpen, 
    unreadConversations, 
    markAsRead
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
