"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type PendingCountContextType = {
  count: number;
  setCount: (count: number) => void;
  refreshCountPending: (clerkId?: string) => Promise<void>;
};

const PendingCountContext = createContext<PendingCountContextType | undefined>(
  undefined
);

export const PendingCountProvider: React.FC<{
  clerkId?: string;
  children: React.ReactNode;
}> = ({ clerkId, children }) => {
  const [count, setCount] = useState(0);

  const refreshCountPending = useCallback(
    async (uid?: string) => {
      if (!uid && !clerkId) return;
      try {
        const response = await fetch(
          `/api/pending/get?clerkId=${uid || clerkId}`
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
    <PendingCountContext.Provider
      value={{ count, setCount, refreshCountPending }}
    >
      {children}
    </PendingCountContext.Provider>
  );
};

export function usePendingCount() {
  const ctx = useContext(PendingCountContext);
  if (!ctx)
    throw new Error("usePendingCount must be used within PendingCountProvider");
  return ctx;
}
