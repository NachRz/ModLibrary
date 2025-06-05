import React from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/styles/components/common/Cards/UserCard.css';

const UserCard = ({ 
  user, 
  onClick,
  showLink = true 
}) => {

  // Manejar el clic en la tarjeta
  const handleCardClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(user);
    }
  };

  // Determinar la URL del usuario
  const userUrl = `/usuarios/${user.id}/perfil`;

  // Obtener la imagen del avatar
  const avatarUrl = user.avatar || user.foto_perfil || user.profile_image;

  // Obtener el nombre del usuario
  const userName = user.username || user.nome_usuario || user.name || user.nombre || 'Usuario';
  
  // Obtener las iniciales del usuario para el avatar por defecto
  const getUserInitials = (name) => {
    const nombres = name.split(' ').filter(n => n.length > 0);
    if (nombres.length >= 2) {
      return (nombres[0][0] + nombres[1][0]).toUpperCase();
    } else if (nombres.length === 1) {
      return nombres[0][0].toUpperCase();
    }
    return 'U';
  };

  const CardContent = (
    <div 
      className="user-card"
      onClick={handleCardClick}
    >
      {/* Avatar del usuario */}
      <div className="user-card-avatar">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName} 
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.querySelector('.user-avatar-fallback').style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="user-avatar-fallback" 
          style={{ display: avatarUrl ? 'none' : 'flex' }}
        >
          {getUserInitials(userName)}
        </div>
      </div>
      
      {/* Nombre del usuario */}
      <div className="user-card-content">
        <h3 className="user-card-name">
          {userName}
        </h3>
      </div>
    </div>
  );

  // Si hay onClick o no se debe mostrar link, no usar Link
  if (onClick || !showLink) {
    return CardContent;
  }

  // Si no hay onClick, envolver en Link
  return (
    <Link to={userUrl} className="user-card-link">
      {CardContent}
    </Link>
  );
};

export default UserCard; 