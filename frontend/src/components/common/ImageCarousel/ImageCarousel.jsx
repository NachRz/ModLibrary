import React, { useState, useEffect } from 'react';
import '../../../assets/styles/components/common/ImageCarousel/ImageCarousel.css';

const ImageCarousel = ({ images = [], className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  const imagenesCarrusel = images.length > 0 ? images : ['/images/mod-placeholder.jpg'];

  // Calcular las imágenes visibles (mostrar máximo 5 a la vez)
  const getVisibleImages = () => {
    const visibleImages = [];
    const maxVisibleImages = Math.min(5, imagenesCarrusel.length);
    
    for (let i = 0; i < maxVisibleImages; i++) {
      const index = currentImageIndex + i;
      if (index < imagenesCarrusel.length) {
        visibleImages.push({
          src: imagenesCarrusel[index],
          originalIndex: index
        });
      }
    }
    return visibleImages;
  };

  // Verificar si se puede navegar
  const maxVisibleAtOnce = Math.min(5, imagenesCarrusel.length);
  const canGoPrev = currentImageIndex > 0;
  const canGoNext = currentImageIndex < imagenesCarrusel.length - maxVisibleAtOnce;

  // Funciones de navegación del carrusel
  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  // Funciones del lightbox
  const openLightbox = (imageIndex) => {
    setLightboxImageIndex(imageIndex);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const goToPrevLightbox = () => {
    setLightboxImageIndex(prev => 
      prev > 0 ? prev - 1 : imagenesCarrusel.length - 1
    );
  };

  const goToNextLightbox = () => {
    setLightboxImageIndex(prev => 
      prev < imagenesCarrusel.length - 1 ? prev + 1 : 0
    );
  };

  // Manejar teclas del teclado en el lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevLightbox();
          break;
        case 'ArrowRight':
          goToNextLightbox();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Prevenir scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  return (
    <>
      {/* Carrusel principal */}
      <div className={`image-carousel ${className}`}>
        <div className="carousel-container">
          {/* Botón anterior */}
          {canGoPrev && (
            <button 
              className="carousel-nav-btn prev" 
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          {/* Galería horizontal */}
          <div className="gallery-horizontal">
            <div className="gallery-images-container">
              {getVisibleImages().map((image, index) => (
                <div 
                  key={index}
                  className="gallery-image-item"
                  onClick={() => openLightbox(image.originalIndex)}
                >
                  <img 
                    src={image.src} 
                    alt={`Imagen ${image.originalIndex + 1}`}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <i className="fas fa-search-plus"></i>
                  </div>
                  
                  {/* Mostrar contador en la imagen central */}
                  {((imagenesCarrusel.length > 1 && index === Math.floor(getVisibleImages().length / 2)) || 
                    (imagenesCarrusel.length === 1 && index === 0)) && (
                    <div className="image-counter-overlay">
                      {imagenesCarrusel.length} {imagenesCarrusel.length === 1 ? 'imagen' : 'imágenes'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botón siguiente */}
          {canGoNext && (
            <button 
              className="carousel-nav-btn next" 
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* Botón cerrar */}
            <button 
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Cerrar"
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Imagen principal */}
            <div className="lightbox-image-container">
              <img 
                src={imagenesCarrusel[lightboxImageIndex]} 
                alt={`Imagen ${lightboxImageIndex + 1}`}
                className="lightbox-image"
              />
            </div>

            {/* Controles de navegación */}
            {imagenesCarrusel.length > 1 && (
              <>
                <button 
                  className="lightbox-nav-btn prev"
                  onClick={goToPrevLightbox}
                  aria-label="Imagen anterior"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                <button 
                  className="lightbox-nav-btn next"
                  onClick={goToNextLightbox}
                  aria-label="Imagen siguiente"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}

            {/* Información de la imagen */}
            <div className="lightbox-info">
              <span className="image-counter">
                {lightboxImageIndex + 1} de {imagenesCarrusel.length}
              </span>
            </div>

            {/* Thumbnails */}
            {imagenesCarrusel.length > 1 && (
              <div className="lightbox-thumbnails">
                {imagenesCarrusel.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${index === lightboxImageIndex ? 'active' : ''}`}
                    onClick={() => setLightboxImageIndex(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel; 