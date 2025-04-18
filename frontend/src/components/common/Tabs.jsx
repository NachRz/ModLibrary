import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

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
                    ? 'text-custom-primary'
                    : 'text-custom-detail hover:text-custom-text'
                  }
                `}
              >
                <span className="relative z-10">{tab.label}</span>
                {/* Indicador activo */}
                {activeTab === index && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-custom-primary"></span>
                )}
                {/* Efecto hover */}
                <span className={`
                  absolute bottom-0 left-0 w-full h-full transform transition-transform duration-300 
                  ${activeTab === index ? 'bg-custom-primary/10' : 'bg-transparent'} 
                  ${activeTab === index ? 'opacity-100' : 'opacity-0 hover:opacity-10'}
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