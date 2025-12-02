"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type NotificationCountContextType = {
  count: number;
  setCount: (count: number) => void;
  refreshCountNotification: (clerkId: string | undefined) => Promise<void>;
};

const NotificationCountContext = createContext<
  NotificationCountContextType | undefined
>(undefined);

export const NotificationCountProvider: React.FC<{
  clerkId?: string;
  children: React.ReactNode;
}> = ({ clerkId, children }) => {
  const [count, setCount] = useState(0);
  console.log(count);

  const refreshCountNotification = useCallback(
    async (uid?: string) => {
      if (!uid && !clerkId) return;
      try {
        const response = await fetch(
          `/api/notification/count?clerkId=${uid || clerkId}`
        );
        const data = await response.json();
        setCount(data.count);
      } catch {
        setCount(0);
      }
    },
    [clerkId]
  );

  return (
    <NotificationCountContext.Provider
      value={{ count, setCount, refreshCountNotification }}
    >
      {children}
    </NotificationCountContext.Provider>
  );
};

export function useNotificationCount() {
  const ctx = useContext(NotificationCountContext);
  if (!ctx)
    throw new Error(
      "useNotificationCount must be used within NotificationCountProvider"
    );
  return ctx;
}
