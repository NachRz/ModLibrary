import React, { useState, useEffect } from 'react';

const Tabs = ({ tabs, defaultTab = 0, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Actualizar activeTab cuando cambia defaultTab desde fuera
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

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
                  ${activeTab === index
                    ? 'text-blue-400'
                    : 'text-custom-detail hover:text-custom-text'
                  }
                  focus:outline-none whitespace-nowrap
                `}
              >
                <span className="relative z-10">{tab.label}</span>
                
                {/* Indicador activo - línea debajo */}
                {activeTab === index && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full transform transition-transform duration-300"></span>
                )}
                
                {/* Efecto sutil al pasar el ratón */}
                <span className={`
                  absolute inset-0 bg-blue-400/5 opacity-0 transition-opacity duration-200
                  ${activeTab === index ? 'opacity-100' : 'group-hover:opacity-75'}
                `}></span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas con animación */}
      <div className="p-6 transition-all duration-300 animate-fadeIn">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs; 