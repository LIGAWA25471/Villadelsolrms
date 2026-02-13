import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }

  async validateUser(userId: string, branchId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user && user.branchId === branchId) {
      return user;
    }

    return null;
  }

  async getBranchContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });

    return user?.branch;
  }
}
