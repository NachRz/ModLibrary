import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import useBreadcrumb from '../../hooks/useBreadcrumb';

const PageContainer = ({ children, className = '' }) => {
  const breadcrumbItems = useBreadcrumb();

  return (
    <div className={`min-h-screen bg-custom-bg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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