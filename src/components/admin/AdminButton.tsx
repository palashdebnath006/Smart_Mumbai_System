'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useAdmin';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define our own props type since ButtonProps isn't exported from the UI component
interface AdminButtonProps {
  children: ReactNode;
  showLock?: boolean;
  unauthorizedMessage?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
}

/**
 * A button component that only renders its content for admin users.
 * Non-admin users will either see nothing or a locked button based on props.
 * 
 * @example
 * // Basic usage - button only shows for admins
 * <AdminButton onClick={handleAddSensor}>
 *   Add Sensor
 * </AdminButton>
 * 
 * @example
 * // Show locked button for non-admins
 * <AdminButton showLock onClick={handleAddSensor}>
 *   Add Sensor
 * </AdminButton>
 */
export function AdminButton({ 
  children, 
  showLock = false, 
  unauthorizedMessage,
  disabled,
  className,
  ...props 
}: AdminButtonProps) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    if (showLock) {
      return (
        <Button disabled className={cn("relative", className)} {...props}>
          <Lock className="w-4 h-4 mr-2" />
          {children}
          {unauthorizedMessage && (
            <span className="sr-only">{unauthorizedMessage}</span>
          )}
        </Button>
      );
    }
    return null;
  }

  return (
    <Button disabled={disabled} className={className} {...props}>
      {children}
    </Button>
  );
}

/**
 * Wrapper component that only renders children for admin users.
 * Use this for more complex admin-only UI elements.
 * 
 * @example
 * <AdminOnly>
 *   <div className="admin-panel">
 *     <h3>Admin Controls</h3>
 *     <Button>Delete All</Button>
 *   </div>
 * </AdminOnly>
 */
export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
