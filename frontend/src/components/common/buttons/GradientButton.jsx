import React from 'react';
import '../../../assets/styles/components/common/buttons/buttons.css'; // Ruta actualizada a la nueva ubicación

/**
 * Botón con efecto de gradiente suave en hover
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de botón (button, submit, reset)
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {React.ReactNode} props.icon - Icono opcional para mostrar a la izquierda
 * @param {string} props.className - Clases adicionales para el botón
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @returns {JSX.Element} Componente botón con gradiente
 */
const GradientButton = ({
  type = 'button',
  children,
  icon,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`gradient-button group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-secondary focus:ring-offset-1 shadow-md overflow-hidden ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
          {icon}
        </span>
      )}
      <span className={`${icon ? 'ml-2' : ''} relative z-10`}>{children}</span>
    </button>
  );
};

export default GradientButton; 