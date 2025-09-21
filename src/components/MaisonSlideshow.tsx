"use client";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

export default function MaisonSlideshow({ images }: { images: string[] }) {
  if (!images || images.length === 0) {
    return <div className="no-images">No images available</div>;
  }
  return (
    <div className="maison-slideshow-wrapper">
      <Slide
        autoplay={false}
        arrows={true}
        indicators={true}
        duration={3000}
        transitionDuration={500}
        cssClass="maison-slideshow"
      >
        {images.map((img, idx) => (
          <div className="each-slide" key={idx}>
            <img src={img} alt={`Maison image ${idx + 1}`} />
          </div>
        ))}
      </Slide>
    </div>
  );
}
