import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class DrugsService {
  constructor(private prisma: PrismaService) {}

  async search(q: string) {
    const query = q?.toLowerCase().trim() ?? '';
    return this.prisma.drug.findMany({
      where: {
        isActive: true,
        ...(query && { name: { contains: query } }),
      },
      orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
      take: 20,
      select: { id: true, name: true, usageCount: true },
    });
  }
}
