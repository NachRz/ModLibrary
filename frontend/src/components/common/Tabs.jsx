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
    <div className="w-full bg-custom-bg rounded-t-custom overflow-hidden">
      {/* Navegación de pestañas */}
      <div className="bg-custom-card border-b border-custom-detail/20 shadow-custom">
        <div className="max-w-7xl mx-auto">
          <nav className="flex" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`
                  relative py-4 px-6 text-sm font-medium transition-all duration-300 overflow-hidden
                  ${activeTab === index
                    ? 'text-custom-text font-semibold'
                    : 'text-custom-detail hover:text-custom-text'
                  }
                `}
              >
                <span className="relative z-10">{tab.label}</span>
                {/* Indicador activo */}
                {activeTab === index && (
                  <>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-custom-secondary"></span>
                    <span className="absolute inset-0 bg-custom-primary/15"></span>
                  </>
                )}
                {/* Efecto hover */}
                <span className={`
                  absolute bottom-0 left-0 w-full h-full transform transition-transform duration-300 
                  ${activeTab === index ? 'opacity-100' : 'opacity-0 hover:opacity-10 bg-custom-primary/10'} 
                `}></span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-6 p-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs; 