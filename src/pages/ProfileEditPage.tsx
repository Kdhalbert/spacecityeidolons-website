import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { PageHero } from '../components/ui';

/**
 * ProfileEditPage - allows users to edit their own profile
 */
export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const userId = user?.id;
  const { data: profile, isLoading: profileIsLoading } = useProfile(userId);
  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (data: any) => {
    if (!userId) return;

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await updateProfileMutation.mutateAsync({
        userId,
        ...data,
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to update profile. Please try again.'
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <PageHero
        title="Edit Your Profile"
        subtitle="Share your gaming interests and connect with other players"
      />

      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginLeft: '32px',
          marginRight: '32px',
          fontFamily: 'sans-serif',
        }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginLeft: '32px',
          marginRight: '32px',
          fontFamily: 'sans-serif',
        }}>
          {errorMessage}
        </div>
      )}

      <ProfileEditor
        profile={profile || null}
        isLoading={profileIsLoading || updateProfileMutation.isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ProfileEditPage;
