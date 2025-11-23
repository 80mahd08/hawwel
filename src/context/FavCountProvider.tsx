"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type FavCountContextType = {
  count: number;
  setCount: (count: number) => void;
  refreshCountFav: (clerkId: string) => Promise<void>;
};

const FavCountContext = createContext<FavCountContextType | undefined>(
  undefined
);

export const FavCountProvider: React.FC<{
  clerkId?: string;
  children: React.ReactNode;
}> = ({ clerkId, children }) => {
  const [count, setCount] = useState(0);

  const refreshCountFav = useCallback(
    async (uid?: string) => {
      if (!uid && !clerkId) return;
      try {
        const response = await fetch(
          `/api/favorite/get?clerkId=${uid || clerkId}`
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
    <FavCountContext.Provider value={{ count, setCount, refreshCountFav }}>
      {children}
    </FavCountContext.Provider>
  );
};

export function useFavCount() {
  const ctx = useContext(FavCountContext);
  if (!ctx) throw new Error("useFavCount must be used within FavCountProvider");
  return ctx;
}
