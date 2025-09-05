import { PrismaClient } from '@prisma/client';
import * as store from '../app/api/store';

if (process.env.MOCK_MODE === 'true') {
  const collections: Record<string, any[]> = {
    property: store.properties,
    tenant: store.tenants,
    expense: store.expenses,
    document: store.documents,
    reminder: store.reminders,
    income: store.rentLedger,
    rent: store.rentLedger,
    rentLedger: store.rentLedger,
    notification: store.notifications,
  };
  const extras: Record<string, any[]> = {};
  const getCollection = (type: string) => collections[type] ?? (extras[type] ??= []);
  const allCollections = () => ({ ...collections, ...extras });
  const findRecord = (id: string) => {
    for (const [type, col] of Object.entries(allCollections())) {
      const index = col.findIndex((i: any) => i.id === id);
      if (index !== -1) return { type, col, index };
    }
    return null;
  };
  const mockData = {
    findMany: async ({ where: { type } }: any) => {
      const col = getCollection(type);
      return col.map((data: any) => ({ id: data.id, type, data }));
    },
    findUnique: async ({ where: { id } }: any) => {
      const rec = findRecord(id);
      if (!rec) return null;
      return { id, type: rec.type, data: rec.col[rec.index] };
    },
    create: async ({ data }: any) => {
      const { id, type, data: payload } = data;
      const col = getCollection(type);
      col.push(payload);
      return { id, type, data: payload };
    },
    update: async ({ where: { id }, data: { data: payload } }: any) => {
      const rec = findRecord(id);
      if (!rec) return null;
      rec.col[rec.index] = payload;
      return { id, type: rec.type, data: payload };
    },
    delete: async ({ where: { id } }: any) => {
      const rec = findRecord(id);
      if (!rec) return null;
      rec.col.splice(rec.index, 1);
      return { id };
    },
    upsert: async ({ where: { id }, create, update }: any) => {
      const rec = findRecord(id);
      if (rec) {
        return mockData.update({ where: { id }, data: update });
      }
      return mockData.create({ data: create });
    },
  };
  export const prisma = { mockData } as any;
} else {
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['error'],
    });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}
