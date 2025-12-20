"use client";
import { useState, useEffect } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";

export default function HouseSlideshow({ images }: { images: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!images || images.length === 0) {
    return <div className="no-images">No images available</div>;
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Determine grid class based on image count
  const gridClass = images.length === 1 ? "grid-1" :
                    images.length === 2 ? "grid-2" :
                    images.length === 3 ? "grid-3" :
                    images.length === 4 ? "grid-4" : "grid-5";

  return (
    <>
      <div className="house-gallery-container">
        {/* Mobile Slider */}
        <div className="mobile-slider">
          <Slide
            autoplay={false}
            arrows={true}
            indicators={true}
            cssClass="house-slideshow"
            transitionDuration={300}
          >
            {images.map((img, idx) => (
              <div className="each-slide" key={idx} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`House image ${idx + 1}`} />
              </div>
            ))}
          </Slide>
        </div>

        {/* Desktop Intelligent Grid */}
        <div className={`desktop-grid ${gridClass}`}>
          {/* Renders images based on count */}
          {images.slice(0, 5).map((img, idx) => {
            // Logic for "main" vs "sub" classes is handled by CSS grid-areas now
            // But we attach click handlers
            return (
              <div 
                key={idx} 
                className={`gallery-item item-${idx + 1}`} 
                onClick={() => openLightbox(idx)}
              >
                <img src={img} alt={`House view ${idx + 1}`} />
                {images.length > 5 && idx === 4 && (
                  <div className="more-overlay">
                    <span>+{images.length - 5} more</span>
                  </div>
                )}
              </div>
            );
          })}
          
          <button className="show-all-btn" onClick={() => openLightbox(0)}>
            <span className="icon">⋮⋮</span> Show all photos
          </button>
        </div>
      </div>

      {/* Premium Full Screen Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            <div className="lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
               <span className="counter">{currentIndex + 1} / {images.length}</span>
               <button className="close-btn" onClick={closeLightbox}>✕</button>
            </div>
            
            <div className="lightbox-main-stage" onClick={(e) => e.stopPropagation()}>
               <button className="nav-btn prev" onClick={prevSlide}>‹</button>
               
               <div className="image-display-wrapper">
                 <motion.img 
                   key={currentIndex}
                   src={images[currentIndex]} 
                   alt={`Gallery image ${currentIndex + 1}`}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.3 }}
                   className="current-image"
                 />
               </div>

               <button className="nav-btn next" onClick={nextSlide}>›</button>
            </div>

            {/* Thumbnails Strip */}
            <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
              <div className="thumbnails-scroll">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumb-item ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
