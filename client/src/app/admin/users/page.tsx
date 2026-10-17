import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const result = await api.get<{ data: User[] }>('/users');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{ar.users.title}</h1>
        <a
          href="/admin/users/new"
          className="h-11 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          {ar.users.newUser}
        </a>
      </div>

      <div className="space-y-2">
        {result.data.map((user) => (
          <Card key={user.id}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{user.username} â€¢ {ar.roles[user.role]}
                </p>
              </div>
              <Badge variant={user.isActive ? 'default' : 'outline'}>
                {user.isActive ? ar.users.active : ar.users.inactive}
              </Badge>
              <div className="flex gap-2">
                <a
                  href={`/admin/users/${user.id}/edit`}
                  className="h-9 px-3 inline-flex items-center rounded-md border text-sm hover:bg-muted"
                >
                  {ar.common.edit}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
