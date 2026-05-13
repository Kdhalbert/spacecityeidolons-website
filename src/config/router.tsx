import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from '../App';
import { ProtectedRoute, PublicRoute, AdminRoute } from './routeComponents';

// Lazy load pages for code splitting
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/HomePage'));
const GamesPage = lazy(() => import('../pages/GamesPage'));
const GameDetailsPage = lazy(() => import('../pages/GameDetailsPage'));
const GameRequestPage = lazy(() => import('../pages/GameRequestPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const EventCreatePage = lazy(() => import('../pages/EventCreatePage'));
const ProfilesPage = lazy(() => import('../pages/ProfilesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/ProfileEditPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const RoadmapPage = lazy(() => import('../pages/RoadmapPage'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'));
const AdminInvitesPage = lazy(() => import('../pages/AdminInvitesPage'));
const MemberRequestPage = lazy(() => import('../pages/MemberRequestPage'));

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

const createRoutes = (): RouteObject[] => [
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
        path: 'games/request',
        element: <ProtectedRoute element={<GameRequestPage />} />,
      },
      {
        path: 'games/:id',
        element: <PublicRoute element={<GameDetailsPage />} />,
      },
      {
        path: 'events',
        element: <PublicRoute element={<EventsPage />} />,
      },
      {
        path: 'events/new',
        element: <ProtectedRoute element={<EventCreatePage />} />,
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
        path: 'roadmap',
        element: <PublicRoute element={<RoadmapPage />} />,
      },
      {
        path: 'membership/request',
        element: <ProtectedRoute element={<MemberRequestPage />} />,
      },
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            element: <AdminRoute element={<AdminUsersPage />} />,
          },
          {
            path: 'invites',
            element: <AdminRoute element={<AdminInvitesPage />} />,
          },
        ],
      },
      {
        path: '*',
        element: <PublicRoute element={<NotFoundPage />} />,
      },
    ],
  },
];

export const routes = createRoutes();
export const router = createBrowserRouter(routes);
