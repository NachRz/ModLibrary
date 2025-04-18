import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import ResetPassword from '../components/ResetPassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes; 