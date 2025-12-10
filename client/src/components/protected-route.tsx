import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth, User } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: User['role'];
  redirectTo?: string;
}

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication and/or specific roles.
 *
 * Usage:
 * ```typescript
 * <Route path="/my-projects">
 *   <ProtectedRoute>
 *     <MyProjects />
 *   </ProtectedRoute>
 * </Route>
 *
 * <Route path="/admin">
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * </Route>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole = 'user',
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole, login } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Check role permissions
  if (!hasRole(requiredRole)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. This page requires
            {' '}<strong>{requiredRole}</strong> role or higher.
          </AlertDescription>
        </Alert>

        <div className="mt-8 flex gap-4">
          <Button onClick={() => window.history.back()}>Go Back</Button>
          <Button variant="outline" asChild>
            <a href="/">Go to Homepage</a>
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Your current role: <strong>{user?.role}</strong></p>
          <p>
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Login Page Component
 *
 * Simple login page that redirects to Okta
 * TODO: Implement actual Okta Sign-In Widget
 */
export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Sign In</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to access your projects and manage submissions
        </p>

        <Button onClick={login} size="lg" className="w-full">
          Sign In with Okta
        </Button>

        <p className="mt-8 text-sm text-muted-foreground">
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
}

/**
 * Forbidden Page (403)
 *
 * Displayed when user tries to access a route they don't have permission for
 */
export function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <ShieldAlert className="h-24 w-24 mx-auto mb-6 text-destructive" />
        <h1 className="text-6xl font-bold mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Forbidden</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>

        {user && (
          <div className="mb-8 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              Logged in as: <strong>{user.email}</strong>
            </p>
            <p className="text-sm">
              Role: <strong>{user.role}</strong>
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.history.back()}>Go Back</Button>
          <Button variant="outline" asChild>
            <a href="/">Go to Homepage</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
