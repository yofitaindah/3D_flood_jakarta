import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
