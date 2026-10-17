import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { UserRowActions } from './user-row-actions';
import { UserPlus, UserCog } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTION';
  isActive: boolean;
  lastLoginAt: string | null;
}

export default async function AdminUsersPage() {
  await requireRole(['ADMIN']);

  const result = await api.get<{ data: User[] }>('/users').catch(() => ({ data: [] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ar.users.title}</h1>
          <p className="text-sm text-muted-foreground">إدارة موظفي العيادة وتحديد الأدوار وصلاحيات الوصول</p>
        </div>
        <a
          href="/admin/users/new"
          className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="size-4" />
          {ar.users.newUser}
        </a>
      </div>

      <div className="space-y-3">
        {result.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{ar.common.noData}</div>
        ) : (
          result.data.map((user) => (
            <Card key={user.id} className="shadow-sm hover:shadow transition-shadow">
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      @{user.username} &bull; <span className="font-sans">{ar.roles[user.role]}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={user.isActive ? 'default' : 'outline'} className={user.isActive ? 'bg-emerald-600' : 'text-muted-foreground'}>
                    {user.isActive ? ar.users.active : ar.users.inactive}
                  </Badge>

                  <UserRowActions
                    userId={user.id}
                    userName={user.name}
                    isActive={user.isActive}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
