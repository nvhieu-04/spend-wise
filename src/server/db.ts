import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

type QrHistoryDelegate = {
  findMany: (args: {
    where?: { userId: string };
    orderBy?: { createdAt: "desc" };
    take?: number;
  }) => Promise<unknown[]>;
  create: (args: {
    data: {
      userId: string;
      acqId: string;
      accountNo: string;
      accountName: string;
      amount: number | null;
      addInfo: string | null;
    };
  }) => Promise<unknown>;
};
export const qrHistory = (prisma as PrismaClient & { qrHistory: QrHistoryDelegate }).qrHistory;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
