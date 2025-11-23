"use client";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

export default function HouseSlideshow({ images }: { images: string[] }) {
  if (!images || images.length === 0) {
    return <div className="no-images">No images available</div>;
  }
  return (
    <div className="house-slideshow-wrapper">
      <Slide
        autoplay={false}
        arrows={true}
        indicators={true}
        duration={3000}
        transitionDuration={500}
        cssClass="house-slideshow"
      >
        {images.map((img, idx) => (
          <div className="each-slide" key={idx}>
            <img src={img} alt={`House image ${idx + 1}`} />
          </div>
        ))}
      </Slide>
    </div>
  );
}
