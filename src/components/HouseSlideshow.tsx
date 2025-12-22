"use client";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HouseSlideshow({ images }: { images: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = useTranslations('HouseDetails');

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!images || images.length === 0) {
    return <div className="no-images">{t('noImages')}</div>;
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
              <div className="each-slide" key={idx} onClick={() => openLightbox(idx)} style={{ position: 'relative', height: '300px' }}>
                <NextImage 
                  src={img} 
                  alt={`House image ${idx + 1}`} 
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={idx === 0}
                  unoptimized={true}
                />
              </div>
            ))}
          </Slide>
        </div>

        {/* Desktop Intelligent Grid */}
        <div className={`desktop-grid ${gridClass}`}>
          {/* Renders images based on count */}
          {images.slice(0, 5).map((img, idx) => {
            return (
              <div 
                key={idx} 
                className={`gallery-item item-${idx + 1}`} 
                onClick={() => openLightbox(idx)}
                style={{ position: 'relative' }}
              >
                <NextImage 
                  src={img} 
                  alt={`House view ${idx + 1}`} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  unoptimized={true}
                />
                {images.length > 5 && idx === 4 && (
                  <div className="more-overlay">
                    <span>{t('morePhotos', {count: images.length - 5})}</span>
                  </div>
                )}
              </div>
            );
          })}
          
          <button className="show-all-btn" onClick={() => openLightbox(0)}>
            <span className="icon">⋮⋮</span> {t('showAllPhotos')}
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
               
               <div className="image-display-wrapper" style={{ position: 'relative', width: '100%', height: '80vh' }}>
                 <motion.div
                   key={currentIndex}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.3 }}
                   style={{ position: 'relative', width: '100%', height: '100%' }}
                 >
                   <NextImage 
                     src={images[currentIndex]} 
                     alt={`Gallery image ${currentIndex + 1}`}
                     fill
                     style={{ objectFit: 'contain' }}
                     className="current-image"
                     unoptimized={true}
                   />
                 </motion.div>
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
                    style={{ position: 'relative', width: '80px', height: '60px', flexShrink: 0 }}
                  >
                    <NextImage 
                      src={img} 
                      alt={`Thumb ${idx + 1}`} 
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                      unoptimized={true}
                    />
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
