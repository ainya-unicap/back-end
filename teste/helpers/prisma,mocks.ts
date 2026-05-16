// ============================================================
// prisma.mock.ts — Mock manual do PrismaClient
// Usado nos testes para evitar dependência do prisma generate
// ============================================================

export const createPrismaMock = () => ({
  registroSemanal: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  relatorio: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  periodo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

export type PrismaMock = ReturnType<typeof createPrismaMock>;