'use client';

import { LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ar } from '@/messages/ar';
import { type Role } from '@/lib/roles';

interface UserMenuProps {
  name: string;
  role: Role;
  logoutAction: () => Promise<void>;
}

export function UserMenu({ name, role, logoutAction }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={ar.nav.menu}>
          <UserRound className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs font-normal text-muted-foreground">{ar.roles[role]}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="me-2 size-4 rtl:-scale-x-100" aria-hidden="true" />
              {ar.auth.logout}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
