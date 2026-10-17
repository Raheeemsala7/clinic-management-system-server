import { requireRole } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ar } from '@/messages/ar';
import { NewUserForm } from './new-user-form';
import { UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  await requireRole(['ADMIN']);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <UserPlus className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{ar.users.newUser}</h1>
          <p className="text-sm text-muted-foreground">إنشاء حساب مستخدم جديد وتحديد الصلاحيات</p>
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
