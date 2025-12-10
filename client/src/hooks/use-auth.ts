/**
 * Authentication Hook
 *
 * This hook provides authentication state and methods.
 * Currently returns mock data for development.
 *
 * TODO: Replace with actual Okta authentication when backend is ready
 *
 * Usage:
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 * ```
 */

export interface User {
  id: string;
  oktaId?: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  department?: string;
  theatre?: 'NAM' | 'JAPAC' | 'EMEA' | 'LATAM' | 'Global';
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (requiredRole: User['role']) => boolean;
}

/**
 * Mock authentication for development
 * Replace this with actual Okta integration
 */
export function useAuth(): AuthState {
  // TODO: Replace with Okta authentication
  // import { useOktaAuth } from '@okta/okta-react';
  // const { authState, oktaAuth } = useOktaAuth();

  // Mock user for development
  const mockUser: User = {
    id: 'mock-user-123',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    department: 'Security',
    theatre: 'NAM',
  };

  const login = () => {
    // TODO: Implement Okta login
    // oktaAuth.signInWithRedirect();
    console.log('Login not yet implemented - requires Okta setup');
  };

  const logout = () => {
    // TODO: Implement Okta logout
    // oktaAuth.signOut();
    console.log('Logout not yet implemented - requires Okta setup');
  };

  const hasRole = (requiredRole: User['role']) => {
    if (!mockUser) return false;

    const roleHierarchy: Record<User['role'], number> = {
      user: 1,
      moderator: 2,
      admin: 3,
    };

    return roleHierarchy[mockUser.role] >= roleHierarchy[requiredRole];
  };

  return {
    user: mockUser,
    isAuthenticated: true, // Change to false to test login flow
    isLoading: false,
    login,
    logout,
    hasRole,
  };
}

/**
 * Check if user has required role
 * Used for role-based access control
 */
export function hasRequiredRole(
  userRole: User['role'],
  requiredRole: User['role']
): boolean {
  const roleHierarchy: Record<User['role'], number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
