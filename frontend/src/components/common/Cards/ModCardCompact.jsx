import React from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/styles/components/common/Cards/ModCardCompact.css';

const ModCardCompact = ({
  mod,
  onClick
}) => {

  // Manejar el clic en la tarjeta
  const handleCardClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(mod);
    }
  };

  // Determinar la URL del mod
  const modUrl = `/mods/${mod.id}`;

  // Construir la URL completa de la imagen
  const imageUrl = mod.imagen || (mod.imagen_banner ? `http://localhost:8000/storage/${mod.imagen_banner}` : '/images/mod-placeholder.jpg');

  // Formatear número de descargas
  const formatDownloads = (downloads) => {
    const totalDescargas = mod.total_descargas || mod.descargas || downloads || 0;
    if (totalDescargas >= 1000000) {
      return `${(totalDescargas / 1000000).toFixed(1)}M`;
    } else if (totalDescargas >= 1000) {
      return `${(totalDescargas / 1000).toFixed(1)}k`;
    }
    return totalDescargas.toString();
  };

  const CardContent = (
    <div
      className="mod-card-compact-new"
      onClick={handleCardClick}
    >
      {/* Imagen del mod */}
      <div className="mod-card-compact-image">
        <img
          src={imageUrl}
          alt={mod.titulo}
          loading="lazy"
        />
        <div className="mod-card-compact-overlay"></div>
      </div>

      {/* Contenido */}
      <div className="mod-card-compact-content">
        <div className="mod-card-compact-info">
          <h3 className="mod-card-compact-title">
            {mod.titulo}
          </h3>
          <p className="mod-card-compact-author">
            {mod.autor || mod.creador?.nome || 'Autor desconocido'}
          </p>
        </div>

        <div className="mod-card-compact-stats">
          <div className="mod-card-compact-downloads">
            <svg className="download-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{formatDownloads()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Si hay onClick, no usar Link
  if (onClick) {
    return CardContent;
  }

  // Si no hay onClick, envolver en Link
  return (
    <Link to={modUrl} className="mod-card-compact-link">
      {CardContent}
    </Link>
  );
};

export default ModCardCompact; 