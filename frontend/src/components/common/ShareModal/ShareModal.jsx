import React, { useState } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import '../../../assets/styles/components/common/ShareModal/ShareModal.css';

const ShareModal = ({ isOpen, onClose, modTitle, modUrl, modDescription }) => {
  const { showNotification } = useNotification();
  const [copySuccess, setCopySuccess] = useState(false);

  // Construir el enlace completo del mod
  const fullUrl = `${window.location.origin}${modUrl}`;

  // Textos para compartir
  const shareText = `¡Mira este increíble mod! ${modTitle}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedDescription = encodeURIComponent(modDescription || '');

  // URLs para compartir en redes sociales
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    discord: `https://discord.com/channels/@me`
  };

  // Función para copiar el enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopySuccess(true);
      showNotification('¡Enlace copiado al portapapeles!', 'success');
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        showNotification('¡Enlace copiado al portapapeles!', 'success');
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (err) {
        showNotification('Error al copiar el enlace', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  // Función para abrir redes sociales
  const shareToSocial = (platform) => {
    if (platform === 'discord') {
      // Para Discord, copiamos el enlace y avisamos al usuario
      copyToClipboard();
      showNotification('Enlace copiado. Pégalo en Discord', 'info');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Función para enviar por email
  const shareByEmail = () => {
    const subject = encodeURIComponent(`Te recomiendo este mod: ${modTitle}`);
    const body = encodeURIComponent(`Hola,\n\nTe recomiendo este increíble mod que encontré:\n\n"${modTitle}"\n\n${modDescription || ''}\n\nPuedes verlo aquí: ${fullUrl}\n\n¡Espero que te guste!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>
            <i className="fas fa-share-alt"></i>
            Compartir mod
          </h3>
          <button className="share-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="share-modal-body">
          <div className="share-mod-info">
            <h4>{modTitle}</h4>
            <p className="share-url">{fullUrl}</p>
          </div>

          {/* Opción de copiar enlace */}
          <div className="share-option-section">
            <h5>Copiar enlace</h5>
            <div className="copy-link-container">
              <input
                type="text"
                value={fullUrl}
                readOnly
                className="copy-link-input"
              />
              <button
                className={`copy-link-btn ${copySuccess ? 'success' : ''}`}
                onClick={copyToClipboard}
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                {copySuccess ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="share-option-section">
            <h5>Compartir en redes sociales</h5>
            <div className="social-share-grid">
              <button
                className="social-share-btn twitter"
                onClick={() => shareToSocial('twitter')}
                title="Compartir en Twitter"
              >
                <i className="fab fa-twitter"></i>
                <span>Twitter</span>
              </button>

              <button
                className="social-share-btn facebook"
                onClick={() => shareToSocial('facebook')}
                title="Compartir en Facebook"
              >
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </button>

              <button
                className="social-share-btn reddit"
                onClick={() => shareToSocial('reddit')}
                title="Compartir en Reddit"
              >
                <i className="fab fa-reddit-alien"></i>
                <span>Reddit</span>
              </button>

              <button
                className="social-share-btn whatsapp"
                onClick={() => shareToSocial('whatsapp')}
                title="Compartir en WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </button>

              <button
                className="social-share-btn telegram"
                onClick={() => shareToSocial('telegram')}
                title="Compartir en Telegram"
              >
                <i className="fab fa-telegram-plane"></i>
                <span>Telegram</span>
              </button>

              <button
                className="social-share-btn discord"
                onClick={() => shareToSocial('discord')}
                title="Compartir en Discord"
              >
                <i className="fab fa-discord"></i>
                <span>Discord</span>
              </button>
            </div>
          </div>

          {/* Compartir por email */}
          <div className="share-option-section">
            <h5>Otras opciones</h5>
            <button
              className="email-share-btn"
              onClick={shareByEmail}
              title="Compartir por email"
            >
              <i className="fas fa-envelope"></i>
              <span>Enviar por email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 