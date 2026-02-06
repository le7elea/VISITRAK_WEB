import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { FaUser } from "react-icons/fa";
import Header from "./Header";

export default function BackgroundCarousel({ images, isMobile = false, isTablet = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const swiperRef = useRef(null);

  // Responsive scaling
  const getScale = () => {
    if (windowWidth > 1024) return 1.3; // Desktop
    if (windowWidth > 768) return 1.1; // Tablet
    return 1; // Mobile
  };

  const getBannerHeight = () => {
    if (windowWidth > 1024) return "h-[280px] lg:h-[320px]"; // Desktop
    if (windowWidth > 768) return "h-[240px] md:h-[280px]"; // Tablet
    return "h-[200px] sm:h-[220px]"; // Mobile
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (swiperRef.current) {
        const swiper = swiperRef.current.swiper;
        if (swiper && !swiper.destroyed) {
          swiper.slideNext();
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scale = getScale();
  const bannerHeight = getBannerHeight();

  return (
    <div className={`w-full relative overflow-visible ${bannerHeight}`}>
      {/* Swiper Carousel */}
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
        loop={true}
        className="w-full h-full overflow-visible swiper-allow-overflow"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-full bg-cover bg-center relative overflow-visible"
              style={{
                backgroundImage: `url(${image})`,
                padding: `${isMobile ? '1.5rem' : '2rem'} ${isMobile ? '1.5rem' : '2rem'} 0`,
                paddingTop: `${30 * scale}px`,
                paddingLeft: `${24 * scale}px`,
                paddingRight: `${24 * scale}px`,
              }}
            >
              {/* Content Container */}
              <div className="h-full flex flex-col relative">
                {/* Header */}
                <Header title="VisiTrak" scale={scale} />

                {/* Title */}
                <h1
                  className="text-white font-bold mt-2 md:mt-4 tracking-wide leading-tight"
                  style={{
                    fontSize: `${isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem'}`, // 24px mobile, 28px tablet, 32px desktop
                  }}
                >
                  Your Visit Matters
                </h1>

                {/* Subtitle */}
                <p
                  className="text-white mt-1 md:mt-2 max-w-full md:max-w-[90%] lg:max-w-[80%]"
                  style={{
                    fontSize: `${isMobile ? '0.875rem' : isTablet ? '1rem' : '1.125rem'}`, // 14px mobile, 16px tablet, 18px desktop
                    lineHeight: '1.4',
                  }}
                >
                  Thank you for being part of our vibrant community!
                </p>

                {/* 👤 Floating Avatar (OVERLAP FIXED) */}
                <div className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                    style={{ bottom: `-${36 * scale}px` }}>
                  <div
                    className="bg-white flex items-center justify-center border-2 border-[#7a2ff2] shadow-xl"
                    style={{
                      width: isMobile ? 70 : isTablet ? 80 : 90,
                      height: isMobile ? 70 : isTablet ? 80 : 90,
                      borderRadius: "9999px",
                    }}
                  >
                    <FaUser
                      style={{
                        fontSize: isMobile ? "1.75rem" : isTablet ? "2rem" : "2.25rem",
                        color: "#6b2fd1",
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* Gradient Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Dots for better control */}
      <div
        className="absolute bottom-4 left-0 right-0 flex justify-center items-center z-10"
        style={{
          gap: `${8 * scale}px`,
        }}
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (swiperRef.current) {
                swiperRef.current.swiper.slideTo(index);
              }
            }}
            className="transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: `${10 * scale}px`,
                height: `${10 * scale}px`,
                backgroundColor: index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
