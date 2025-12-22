"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import SearchFilter from "../SearchFilter/SearchFilter";

export default function HeroSection() {
  const t = useTranslations('HeroSection');
  return (
    <section className="hero-section">
      <div className="hero-background">
        {/* Placeholder for a real image, using a gradient for now or a reliable Unsplash URL if permissible. 
            Using a sophisticated gradient as specialized implementation. */}
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container hero-content">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t.rich('title', {
              span: (chunks) => <span className="highlight">{chunks}</span>
            })}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <motion.div 
          className="hero-search-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        >
          <SearchFilter />
        </motion.div>
      </div>
    </section>
  );
}
