"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

interface IHouseBasic {
  _id: string;
  title: string;
  pricePerDay: number;
  images: string[];
  location: string;
  rating?: number;
  amenities?: string[];
  propertyType?: string;
}

interface CompareContextType {
  compareList: IHouseBasic[];
  addToCompare: (house: IHouseBasic) => void;
  removeFromCompare: (houseId: string) => void;
  clearCompare: () => void;
  isInCompare: (houseId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<IHouseBasic[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse compare list", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (house: IHouseBasic) => {
    if (compareList.some((h) => h._id === house._id)) {
      toast.error("Already in comparison list");
      return;
    }
    if (compareList.length >= 3) {
      toast.error("You can only compare up to 3 properties");
      return;
    }
    setCompareList((prev) => [...prev, house]);
    toast.success("Added to comparison");
  };

  const removeFromCompare = (houseId: string) => {
    setCompareList((prev) => prev.filter((h) => h._id !== houseId));
    toast.success("Removed from comparison");
  };

  const clearCompare = () => {
    setCompareList([]);
    toast.success("Comparison list cleared");
  };

  const isInCompare = (houseId: string) => {
    return compareList.some((h) => h._id === houseId);
  };

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
