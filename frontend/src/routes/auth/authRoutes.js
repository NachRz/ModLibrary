// Rutas de autenticación
import { Route } from 'react-router-dom';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';
import ResetPassword from '../../components/auth/ResetPassword';
import GuestRoute from '../../middlewares/guestMiddleware';

const authRoutes = [
  <Route
    key="login"
    path="/login"
    element={
      <GuestRoute>
        <Login />
      </GuestRoute>
    }
  />,
  <Route
    key="register"
    path="/register"
    element={
      <GuestRoute>
        <Register />
      </GuestRoute>
    }
  />,
  <Route
    key="reset-password"
    path="/reset-password"
    element={
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    }
  />,
];

export default authRoutes;