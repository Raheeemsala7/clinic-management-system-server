'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deactivateUserAction, resetPasswordAction } from '@/features/users/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/use-i18n';
import { KeyRound, UserX, Loader2 } from 'lucide-react';

interface UserRowActionsProps {
  userId: string;
  userName: string;
  isActive: boolean;
}

export function UserRowActions({ userId, userName, isActive }: UserRowActionsProps) {
  const { t, isAr } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = () => {
    if (!confirm(t.users.deactivateConfirm)) return;
    startTransition(async () => {
      await deactivateUserAction(userId);
    });
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 8) {
      setError(
        isAr
          ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
          : 'Password must be at least 8 characters',
      );
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await resetPasswordAction(userId, newPassword);
      if (res.success) {
        setResetDialogOpen(false);
        setNewPassword('');
      } else {
        setError(res.error ?? t.errors.generic);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setResetDialogOpen(true)}
          title={t.users.resetPassword}
        >
          <KeyRound className="size-3.5 me-1" />
          {t.users.resetPassword}
        </Button>

        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeactivate}
            disabled={isPending}
            title={t.users.deactivate}
          >
            <UserX className="size-3.5 me-1" />
            {t.users.deactivate}
          </Button>
        )}
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.users.resetPassword}</DialogTitle>
            <DialogDescription>
              {isAr
                ? 'تعيين كلمة مرور جديدة للمستخدم: '
                : 'Set a new password for user: '}
              <span className="font-semibold text-foreground">{userName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t.users.newPassword}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                dir="ltr"
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)} disabled={isPending}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleResetPassword} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin me-2" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
