import React, { useState, useEffect } from 'react';

const Tabs = ({ tabs = [], defaultTab = 0, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Actualizar activeTab cuando cambia defaultTab desde fuera
  useEffect(() => {
    // Validar que el defaultTab esté dentro del rango
    if (tabs.length > 0 && defaultTab >= 0 && defaultTab < tabs.length) {
      setActiveTab(defaultTab);
    } else if (tabs.length > 0) {
      setActiveTab(0); // Fallback al primer tab si defaultTab es inválido
    }
  }, [defaultTab, tabs.length]);

  const handleTabChange = (index) => {
    // Validar que el índice esté dentro del rango
    if (index >= 0 && index < tabs.length) {
      setActiveTab(index);
      if (onTabChange) {
        onTabChange(index);
      }
    }
  };

  // Si no hay tabs, mostrar un mensaje o componente vacío
  if (!tabs || tabs.length === 0) {
    return (
      <div className="w-full p-6 text-center text-gray-400">
        No hay pestañas disponibles
      </div>
    );
  }

  // Asegurar que activeTab esté dentro del rango válido
  const safeActiveTab = activeTab >= 0 && activeTab < tabs.length ? activeTab : 0;
  const currentTab = tabs[safeActiveTab];

  return (
    <div className="w-full overflow-hidden">
      {/* Navegación de pestañas */}
      <div className="border-b border-custom-detail/10 bg-custom-card/80">
        <div className="px-4">
          <nav className="flex overflow-x-auto hide-scrollbar" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`
                  relative flex items-center py-4 px-5 text-sm font-medium transition-all duration-200
                  ${safeActiveTab === index
                    ? 'text-blue-400'
                    : 'text-custom-detail hover:text-custom-text'
                  }
                  focus:outline-none whitespace-nowrap
                `}
              >
                <span className="relative z-10">{tab?.label || `Tab ${index + 1}`}</span>

                {/* Indicador activo - línea debajo */}
                {safeActiveTab === index && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full transform transition-transform duration-300"></span>
                )}

                {/* Efecto sutil al pasar el ratón */}
                <span className={`
                  absolute inset-0 bg-blue-400/5 opacity-0 transition-opacity duration-200
                  ${safeActiveTab === index ? 'opacity-100' : 'group-hover:opacity-75'}
                `}></span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas con animación */}
      <div className="p-6 transition-all duration-300 animate-fadeIn">
        {currentTab?.content || (
          <div className="text-center text-gray-400">
            Contenido no disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs; 