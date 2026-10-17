'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NavLinks } from '@/components/shell/nav-links';
import { type Role } from '@/lib/roles';
import { ar } from '@/messages/ar';

interface MobileNavProps {
  role: Role;
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="ghost" size="icon" aria-label={ar.nav.menu} onClick={() => setOpen(true)}>
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="start-0 top-0 h-full max-w-xs translate-x-0 translate-y-0 rounded-none">
          <DialogHeader className="text-start">
            <DialogTitle>{ar.nav.menu}</DialogTitle>
          </DialogHeader>
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
