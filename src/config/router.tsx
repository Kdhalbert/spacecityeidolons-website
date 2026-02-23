import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from '../App';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';
import { Loading } from '../components/Loading';

const HomePage = lazy(() => import('../pages/HomePage'));
const GamesPage = lazy(() => import('../pages/GamesPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  // TODO: Implement auth check
  // For now, just return the element
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
};

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <PublicRoute element={<HomePage />} />,
      },
      {
        path: 'games',
        element: <PublicRoute element={<GamesPage />} />,
      },
      {
        path: 'events',
        element: <PublicRoute element={<EventsPage />} />,
      },
      {
        path: 'profile',
        element: <ProtectedRoute element={<ProfilePage />} />,
      },
      {
        path: 'login',
        element: <PublicRoute element={<LoginPage />} />,
      },
      {
        path: 'register',
        element: <PublicRoute element={<RegisterPage />} />,
      },
      {
        path: '*',
        element: <PublicRoute element={<NotFoundPage />} />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
