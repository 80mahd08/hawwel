"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type FavCountContextType = {
  count: number;
  setCount: (count: number) => void;
  refreshCount: (userId: string) => Promise<void>;
};

const FavCountContext = createContext<FavCountContextType | undefined>(
  undefined
);

export const FavCountProvider: React.FC<{
  userId?: string;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(
    async (uid?: string) => {
      if (!uid && !userId) return;
      try {
        const response = await fetch(
          `/api/get-favorites-count?userId=${uid || userId}`
        );
        const data = await response.json();
        setCount(data.count);
      } catch (error) {
        setCount(0);
      }
    },
    [userId]
  );

  return (
    <FavCountContext.Provider value={{ count, setCount, refreshCount }}>
      {children}
    </FavCountContext.Provider>
  );
};

export function useFavCount() {
  const ctx = useContext(FavCountContext);
  if (!ctx) throw new Error("useFavCount must be used within FavCountProvider");
  return ctx;
}
