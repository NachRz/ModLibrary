// Rutas de autenticación
import { Route } from 'react-router-dom';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';
import ResetPassword from '../../components/auth/ResetPassword';

const authRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPassword />} />,
];

export default authRoutes;