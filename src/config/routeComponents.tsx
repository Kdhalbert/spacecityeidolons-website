import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Suspense fallback={<Loading />}>{element}</Suspense>;
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
};
