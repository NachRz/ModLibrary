import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/home/Home';
import Login from '../components/auth/Login';
import ResetPassword from '../components/auth/ResetPassword';
import Dashboard from '../components/dashboard/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes; 