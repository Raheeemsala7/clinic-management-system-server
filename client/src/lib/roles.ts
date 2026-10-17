/** Pure role helpers safe to import from both edge (proxy) and server code. */
export type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTION';

export const ROLES: readonly Role[] = ['ADMIN', 'DOCTOR', 'RECEPTION'];

/** Landing page for each role's home. */
export function homePathForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'DOCTOR':
      return '/doctor';
    case 'RECEPTION':
      return '/reception';
  }
}

/** The route section prefix each role owns. */
export function sectionRole(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname.startsWith('/doctor')) return 'DOCTOR';
  if (pathname.startsWith('/reception')) return 'RECEPTION';
  return null;
}
