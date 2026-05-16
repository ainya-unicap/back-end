process.env.JWT_SECRET = "test-secret";
import { UserService } from "./user.service";
import { prisma } from "../../lib/prisma";
import argon2 from "argon2";
import { AuthService } from "./auth.service";

jest.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("argon2");

const prismaMock = prisma.user as jest.Mocked<typeof prisma.user>;
const argon2Mock = argon2 as jest.Mocked<typeof argon2>;

describe("UserService", () => {
  let service: UserService;

  describe("login", () => {
    it("deve logar com os dados válidos", async () => {
      argon2Mock.verify.mockResolvedValue(true);
      prismaMock.findUnique.mockResolvedValue(
        { 
          id: "550e8400-e29b-41d4-a716-446655440000", 
          name: "João", 
          email: "joao@email.com" 
        } as any
      );
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await expect(
        AuthService.login({ email: "joao@email.com", password: "123456" })
      ).resolves.not.toThrow();
    })
  })
});