import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'veterinarian' | 'student' | 'unverified';

interface RoleInfo {
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

export const useRoleCheck = (): RoleInfo => {
  const { user, session } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !session) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call the database function to get user role
        const { data, error: roleError } = await supabase
          .rpc('get_user_role');

        if (roleError) {
          throw roleError;
        }

        setRole(data as UserRole);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError('Failed to fetch user role');
        // Default to unverified if there's an error
        setRole('unverified');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, session]);

  return { role, loading, error };
};

// Helper hook to check if user has specific role
export const useHasRole = (requiredRole: UserRole): boolean => {
  const { role, loading } = useRoleCheck();
  
  if (loading || !role) return false;
  
  // Admin has access to everything
  if (role === 'admin') return true;
  
  // Check specific role
  return role === requiredRole;
};

// Helper hook to check if user can access veterinary features
export const useCanAccessVetFeatures = (): boolean => {
  const { role, loading } = useRoleCheck();
  
  if (loading || !role) return false;
  
  // Only verified veterinarians and admins can access vet features
  return role === 'veterinarian' || role === 'admin';
};