import { requireRole } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { getServerI18n } from '@/i18n/server';
import { NewUserForm } from './new-user-form';
import { UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  await requireRole(['ADMIN']);
  const { t, isAr } = await getServerI18n();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <UserPlus className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t.users.newUser}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'إنشاء حساب مستخدم جديد وتحديد الصلاحيات' : 'Create a new user account and assign roles'}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <NewUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
