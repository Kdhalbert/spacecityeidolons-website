import { createBrowserRouter, type RouteObject, Navigate } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../context/AuthContext';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';
import { Loading } from '../components/Loading';

const HomePage = lazy(() => import('../pages/HomePage'));
const GamesPage = lazy(() => import('../pages/GamesPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const ProfilesPage = lazy(() => import('../pages/ProfilesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/ProfileEditPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
        path: 'profiles',
        element: <PublicRoute element={<ProfilesPage />} />,
      },
      {
        path: 'profile',
        children: [
          {
            path: 'edit',
            element: <ProtectedRoute element={<ProfileEditPage />} />,
          },
          {
            path: ':userId',
            element: <PublicRoute element={<ProfilePage />} />,
          },
        ],
      },
      {
        path: 'login',
        element: <PublicRoute element={<LoginPage />} />,
      },
      {
        path: 'auth/callback',
        element: <PublicRoute element={<AuthCallback />} />,
      },
      {
        path: '*',
        element: <PublicRoute element={<NotFoundPage />} />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
