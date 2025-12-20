"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import HouseLink from "@/components/HouseLink/HouseLink";
import Pagination from "@/components/Pagination/Pagination";
import { motion, AnimatePresence } from "framer-motion";

const MapView = dynamic(() => import("@/components/MapView/MapView"), { ssr: false });

interface HousesViewProps {
  houses: any[];
  totalPages: number;
  currentPage: number;
  initialView: "list" | "map";
  enableMapToggle?: boolean;
}

export default function HousesView({ houses, totalPages, currentPage, initialView, enableMapToggle = true }: HousesViewProps) {
  const [view, setView] = useState(initialView);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync with URL if it changes externally
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div>
      {enableMapToggle && (
        <div className="view-toggle-container" style={{ display: "flex", justifyContent: "center", margin: "20px 0", gap: "10px" }}>
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "list");
              router.push(`/?${params.toString()}`, { scroll: false });
            }}
            className={`btn ${view === "list" ? "" : "secondary"}`}
            style={{ borderRadius: "10px", padding: "8px 24px" }}
          >
            📋 List View
          </button>
          <button 
             onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", "map");
              router.push(`/?${params.toString()}`, { scroll: false });
            }}
            className={`btn ${view === "map" ? "" : "secondary"}`}
            style={{ borderRadius: "10px", padding: "8px 24px" }}
          >
            🗺️ Map View
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="houses-list">
              {houses.length > 0 ? (
                houses.map((house, index) => (
                  <HouseLink 
                    key={house._id} 
                    house={house} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="no-results" style={{ width: "100%", textAlign: "center", padding: "40px" }}>
                  <h3>No houses found.</h3>
                </div>
              )}
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </motion.div>
        ) : (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <MapView houses={houses} />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .btn.secondary {
          background: #f8fafc;
          color: #64748b;
          box-shadow: none;
          border: 1px solid #e2e8f0;
        }
        .btn.secondary:hover {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
