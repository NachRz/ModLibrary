import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import useBreadcrumb from '../../hooks/useBreadcrumb';

const PageContainer = ({ children, className = '' }) => {
  const breadcrumbItems = useBreadcrumb();
  const location = useLocation();

  // Determinar si estamos en páginas que necesitan ancho extendido
  const isWideLayout = location.pathname.startsWith('/mods') ||
    location.pathname.startsWith('/juegos') ||
    location.pathname.startsWith('/search') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/';
  const maxWidthClass = isWideLayout ? 'max-w-[1600px]' : 'max-w-7xl';

  return (
    <div className={`min-h-screen bg-custom-bg ${className}`}>
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}>
        <Breadcrumb items={breadcrumbItems} />
        {children}
      </div>
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default PageContainer; 