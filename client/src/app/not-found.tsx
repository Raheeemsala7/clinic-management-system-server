import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ar } from '@/i18n/messages/ar';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">{ar.common.notFound}</p>
      <Button asChild>
        <Link href="/">{ar.common.back}</Link>
      </Button>
    </div>
  );
}
