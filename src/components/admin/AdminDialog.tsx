'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Lock } from 'lucide-react';

interface AdminDialogProps {
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** The form content */
  children: ReactNode;
  /** Trigger button variant */
  triggerVariant?: 'add' | 'edit' | 'delete' | 'custom';
  /** Custom trigger button text */
  triggerText?: string;
  /** Custom trigger icon */
  triggerIcon?: ReactNode;
  /** Submit handler */
  onSubmit?: () => void | Promise<void>;
  /** Is submitting state */
  isSubmitting?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Called when dialog opens */
  onOpen?: () => void;
  /** Called when dialog closes */
  onClose?: () => void;
  /** Open state controlled externally */
  open?: boolean;
  /** Open change handler for external control */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A reusable dialog component for admin forms.
 * Only renders for admin users with proper form handling.
 */
export function AdminDialog({
  title,
  description,
  children,
  triggerVariant = 'add',
  triggerText,
  triggerIcon,
  onSubmit,
  isSubmitting = false,
  submitText = 'Save',
  onOpen,
  onClose,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AdminDialogProps) {
  const isAdmin = useIsAdmin();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || ((val: boolean) => setInternalOpen(val));

  // If not admin, show locked button or nothing
  if (!isAdmin) {
    return null;
  }

  const getTriggerContent = () => {
    if (triggerIcon) {
      return (
        <>
          {triggerIcon}
          {triggerText && <span className="ml-2">{triggerText}</span>}
        </>
      );
    }

    switch (triggerVariant) {
      case 'add':
        return (
          <>
            <Plus className="w-4 h-4 mr-2" />
            {triggerText || 'Add New'}
          </>
        );
      case 'edit':
        return (
          <>
            <Edit className="w-4 h-4 mr-2" />
            {triggerText || 'Edit'}
          </>
        );
      case 'delete':
        return (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            {triggerText || 'Delete'}
          </>
        );
      default:
        return triggerText || 'Open';
    }
  };

  const getTriggerButtonVariant = () => {
    if (triggerVariant === 'delete') return 'destructive';
    return 'default';
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) onOpen?.();
        else onClose?.();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={getTriggerButtonVariant()} className="bg-teal-600 hover:bg-teal-700">
          {getTriggerContent()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4"
        >
          {children}
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isSubmitting ? 'Saving...' : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A simplified admin-only button for inline actions.
 */
export function AdminActionButton({
  onClick,
  icon,
  children,
  variant = 'ghost',
  size = 'sm',
  className = '',
  disabled,
}: {
  onClick: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {icon}
      {children}
    </Button>
  );
}
