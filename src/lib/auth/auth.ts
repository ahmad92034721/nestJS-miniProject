import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { PrismaService } from '../database/prisma.service.js';

export function createAuth(prismaService: PrismaService, baseURL: string) {
  return betterAuth({
    baseURL,
    trustedOrigins: [baseURL],
    user: {
      additionalFields: {
        role: {
          type: ['participant', 'admin'],
          defaultValue: 'participant',
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    database: prismaAdapter(prismaService, {
      provider: 'postgresql',
    }),
    rateLimit: {
      enabled: true,
      window: 10,
      max: 100,
    },
    advanced: {
      disableCSRFCheck: false,
    },
  });
}
