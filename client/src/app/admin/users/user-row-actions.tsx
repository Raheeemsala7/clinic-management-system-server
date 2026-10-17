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
import { ar } from '@/messages/ar';
import { KeyRound, UserX, Loader2 } from 'lucide-react';

interface UserRowActionsProps {
  userId: string;
  userName: string;
  isActive: boolean;
}

export function UserRowActions({ userId, userName, isActive }: UserRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = () => {
    if (!confirm(ar.users.deactivateConfirm)) return;
    startTransition(async () => {
      await deactivateUserAction(userId);
    });
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await resetPasswordAction(userId, newPassword);
      if (res.success) {
        setResetDialogOpen(false);
        setNewPassword('');
      } else {
        setError(res.error ?? ar.errors.generic);
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
          title={ar.users.resetPassword}
        >
          <KeyRound className="size-3.5 me-1" />
          {ar.users.resetPassword}
        </Button>

        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeactivate}
            disabled={isPending}
            title={ar.users.deactivate}
          >
            <UserX className="size-3.5 me-1" />
            {ar.users.deactivate}
          </Button>
        )}
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ar.users.resetPassword}</DialogTitle>
            <DialogDescription>
              تعيين كلمة مرور جديدة للمستخدم: <span className="font-semibold text-foreground">{userName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{ar.users.newPassword}</Label>
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
              {ar.common.cancel}
            </Button>
            <Button onClick={handleResetPassword} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin me-2" />}
              {ar.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
