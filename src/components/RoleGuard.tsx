import { ReactNode } from 'react';
import { useRoleCheck, UserRole } from '@/hooks/useRoleCheck';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackMessage?: string;
  redirectToAuth?: boolean;
}

const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallbackMessage,
  redirectToAuth = false 
}: RoleGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRoleCheck();

  // Show loading state while checking authentication and role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if user is not logged in and redirectToAuth is true
  if (!user && redirectToAuth) {
    window.location.href = '/auth';
    return null;
  }

  // Show access denied if user doesn't have required role
  if (!user || !role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                {fallbackMessage || 
                 `This feature requires ${allowedRoles.join(' or ')} access. Your current role: ${role || 'none'}`}
              </p>
              
              {!user && (
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="w-full mb-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              {user && role === 'unverified' && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  <p className="mb-2">To access veterinary features, you need to:</p>
                  <ul className="text-left space-y-1">
                    <li>• Complete your profile verification</li>
                    <li>• Upload your veterinary license</li>
                    <li>• Wait for admin approval</li>
                  </ul>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full mt-2"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has required role, render children
  return <>{children}</>;
};

export default RoleGuard;