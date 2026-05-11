import { Injectable, OnModuleInit } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '@workspace/database';

@Injectable()
export class PrismaService implements OnModuleInit {
  readonly client: PrismaClient = prisma as PrismaClient;

  async onModuleInit() {
    await this.client.$connect();
  }
}
