"use client";
import { createContext, useContext, useState } from "react";

type OrderNumberContextType = {
  userId?: string;
  setUserId: (userId: string) => void;
};
const OrderNumberContext = createContext<OrderNumberContextType | undefined>(
  undefined
);

export const OrderNumberProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  return (
    <OrderNumberContext.Provider value={{ userId, setUserId }}>
      {children}
    </OrderNumberContext.Provider>
  );
};

export function useOrderNumber() {
  const ctx = useContext(OrderNumberContext);
  if (!ctx)
    throw new Error("useOrderNumber must be used within OrderNumberProvider");
  return ctx;
}
