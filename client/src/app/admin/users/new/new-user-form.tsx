'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserAction, type UserActionResult } from '@/features/users/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ar } from '@/i18n/messages/ar';
import { Eye, EyeOff, UserPlus, ArrowRight, ShieldCheck, Stethoscope, UserCircle } from 'lucide-react';

const initial: UserActionResult = { success: false };

export function NewUserForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createUserAction, initial);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'DOCTOR' | 'RECEPTION'>('RECEPTION');

  useEffect(() => {
    if (state.success) {
      router.push('/admin/users');
      router.refresh();
    }
  }, [state.success, router]);

  const roles = [
    {
      value: 'RECEPTION',
      title: ar.roles.RECEPTION,
      description: 'إدارة قائمة الانتظار، حجز المواعيد، تسجيل المرضى، والمدفوعات',
      icon: UserCircle,
    },
    {
      value: 'DOCTOR',
      title: ar.roles.DOCTOR,
      description: 'إجراء الفحوصات والزيارات الطبية، كتابة الوصفات، ومتابعة المرضى',
      icon: Stethoscope,
    },
    {
      value: 'ADMIN',
      title: ar.roles.ADMIN,
      description: 'تحكم كامل في النظام: المستخدمون، الإعدادات، التقارير المالية والإغلاق',
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Role Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{ar.users.role}</Label>
        <input type="hidden" name="role" value={selectedRole} />
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.value;
            return (
              <button
                type="button"
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`flex flex-col text-start p-4 rounded-xl border-2 transition-all ${isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="font-bold text-sm">{r.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{ar.users.name}</Label>
          <Input
            id="name"
            name="name"
            placeholder="مثال: د. أحمد حسن أو سارة محمد"
            required
            disabled={isPending}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">{ar.users.username}</Label>
          <Input
            id="username"
            name="username"
            placeholder="مثال: ahmed_doc أو receptionist1"
            required
            disabled={isPending}
            dir="ltr"
            className="h-11 text-start"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">{ar.users.password}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isPending}
            dir="ltr"
            className="h-11 pe-10 text-start"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">يجب ألا تقل كلمة المرور عن 8 أحرف</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" asChild disabled={isPending}>
          <Link href="/admin/users" className="flex items-center gap-1.5">
            <ArrowRight className="size-4" />
            {ar.common.cancel}
          </Link>
        </Button>
        <Button type="submit" loading={isPending} className="min-w-[140px]">
          <UserPlus className="size-4 me-2" />
          {ar.users.create}
        </Button>
      </div>
    </form>
  );
}
