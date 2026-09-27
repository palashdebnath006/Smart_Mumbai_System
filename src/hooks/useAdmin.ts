'use client';

import { useAuthStore } from '@/store';

/**
 * Custom hook to check if the current user has admin privileges
 * @returns {boolean} true if user is admin, false otherwise
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  // Case-insensitive comparison to handle any role format
  return user?.role?.toLowerCase() === 'admin';
}

/**
 * Custom hook to get the current user's role
 * @returns {string | null} the user's role or null if not authenticated
 */
export function useUserRole(): string | null {
  const user = useAuthStore((state) => state.user);
  return user?.role?.toLowerCase() ?? null;
}

/**
 * Custom hook to check if user is authenticated
 * @returns {boolean} true if authenticated, false otherwise
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated);
}

/**
 * Check if a user has a specific role
 * @param role - The role to check ('admin', 'officer', 'citizen')
 * @returns {boolean} true if user has the role, false otherwise
 */
export function useHasRole(role: string): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role?.toLowerCase() === role.toLowerCase();
}

/**
 * Check if user can perform admin actions
 * This includes admin and officer roles
 * @returns {boolean} true if user can perform admin actions
 */
export function useCanManage(): boolean {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toLowerCase();
  return role === 'admin' || role === 'officer';
}
