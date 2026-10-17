import Link from 'next/link';
import { ar } from '@/messages/ar';

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">403</h1>
        <h2 className="text-2xl font-semibold">{ar.errors.FORBIDDEN}</h2>
        <Link href="/" className="text-primary hover:underline">
          {ar.common.back}
        </Link>
      </div>
    </main>
  );
}
