import { UserService } from "./user.service";
import { prisma } from "../../lib/prisma";
import argon2 from "argon2";

jest.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("argon2");

const prismaMock = prisma.user as jest.Mocked<typeof prisma.user>;
const argon2Mock = argon2 as jest.Mocked<typeof argon2>;

describe("UserService", () => {
  let service: UserService;

  describe("create", () => {
    it("deve criar usuário com dados válidos", async () => {
      argon2Mock.hash.mockResolvedValue("hashed_password");
      prismaMock.create.mockResolvedValue(
        { 
          id: "550e8400-e29b-41d4-a716-446655440000", 
          name: "João", 
          email: "joao@email.com" 
        } as any
      );

      await expect(
        UserService.create({ name: "João", email: "joao@email.com", password: "123456", institution: "550e8400-e29b-41d4-a716-446655440000" })
      ).resolves.not.toThrow();
    });
  });
});