// Testes unitários do AuthService.
// Estratégia: usar MOCKS para Prisma, argon2, jsonwebtoken e crypto;
// usar STUBS (objetos falsos) para representar user e refreshToken.
//
// Os testes cobrem login, refresh e logout sem tocar no banco real.

process.env.JWT_SECRET = "test-secret";

import { prisma } from "../../../lib/prisma";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthService } from "../auth.service";

// MOCK do Prisma
jest.mock("../../../lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

// MOCKs de bibliotecas externas
jest.mock("argon2");
jest.mock("jsonwebtoken");

const prismaUserMock = prisma.user as jest.Mocked<typeof prisma.user>;
const prismaRefreshMock = prisma.refreshToken as jest.Mocked<typeof prisma.refreshToken>;
const argon2Mock = argon2 as jest.Mocked<typeof argon2>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

// STUB de usuário (representa o user que o Prisma retornaria)
const userStub = {
    id: "user-1",
    name: "João",
    email: "joao@email.com",
    password: "hashed-pass",
    role: "aluno",
    institution_id: "inst-1",
} as any;

beforeEach(() => {
    jest.clearAllMocks();
    // Stub do jwt.sign para devolver um access token previsível
    (jwtMock.sign as unknown as jest.Mock).mockReturnValue("fake-access-token");
    // Stub do crypto.randomBytes para devolver um refresh token previsível
    jest.spyOn(crypto, "randomBytes").mockImplementation(
        () => Buffer.from("a".repeat(40)) as any
    );
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("AuthService", () => {
    // ──────────────────────────────────────────────
    // login
    // ──────────────────────────────────────────────
    describe("login", () => {
        it("deve retornar accessToken e refreshToken quando credenciais são válidas", async () => {
            prismaUserMock.findUnique.mockResolvedValue(userStub);
            argon2Mock.verify.mockResolvedValue(true as never);
            prismaRefreshMock.create.mockResolvedValue({} as any);

            const tokens = await AuthService.login({
                email: "joao@email.com",
                password: "123456",
            });

            // findUnique chamado pelo email
            expect(prismaUserMock.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { email: "joao@email.com" } })
            );
            // verifica password com argon2
            expect(argon2Mock.verify).toHaveBeenCalledWith("hashed-pass", "123456");
            // assina access token com o id do usuário
            expect(jwtMock.sign).toHaveBeenCalledWith(
                { sub: "user-1" },
                "test-secret",
                expect.objectContaining({ expiresIn: "15m" })
            );
            // salva refresh token no banco
            expect(prismaRefreshMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ userId: "user-1" }),
                })
            );
            expect(tokens.id).toBe("user-1");
            expect(tokens.accessToken).toBe("fake-access-token");
            expect(typeof tokens.refreshToken).toBe("string");
            expect(tokens.refreshToken.length).toBeGreaterThan(0);
        });

        it("deve lançar 400 quando faltar email", async () => {
            await expect(
                AuthService.login({ email: "", password: "123" })
            ).rejects.toMatchObject({ status: 400 });
            expect(prismaUserMock.findUnique).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando faltar password", async () => {
            await expect(
                AuthService.login({ email: "j@e.com", password: "" })
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar erro quando usuário não existir", async () => {
            prismaUserMock.findUnique.mockResolvedValue(null);

            await expect(
                AuthService.login({ email: "ninguem@email.com", password: "123" })
            ).rejects.toThrow();
            // não chega a verificar password nem a criar refresh
            expect(argon2Mock.verify).not.toHaveBeenCalled();
            expect(prismaRefreshMock.create).not.toHaveBeenCalled();
        });

        it("deve lançar erro quando senha estiver incorreta", async () => {
            prismaUserMock.findUnique.mockResolvedValue(userStub);
            argon2Mock.verify.mockResolvedValue(false as never);

            await expect(
                AuthService.login({ email: "joao@email.com", password: "errada" })
            ).rejects.toThrow();
            // não gera token e não cria refresh
            expect(jwtMock.sign).not.toHaveBeenCalled();
            expect(prismaRefreshMock.create).not.toHaveBeenCalled();
        });
    });

    // ──────────────────────────────────────────────
    // refresh
    // ──────────────────────────────────────────────
    describe("refresh", () => {
        const refreshTokenStub = {
            id: "rt-1",
            token: "valid-token",
            userId: "user-1",
            revoked: false,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h no futuro
            user: userStub,
        } as any;

        it("deve gerar novo par de tokens quando refresh token é válido", async () => {
            prismaRefreshMock.findUnique.mockResolvedValue(refreshTokenStub);
            prismaRefreshMock.delete.mockResolvedValue({} as any);
            prismaRefreshMock.create.mockResolvedValue({} as any);

            const tokens = await AuthService.refresh("valid-token");

            // Rotação: token antigo é deletado
            expect(prismaRefreshMock.delete).toHaveBeenCalledWith({ where: { id: "rt-1" } });
            // Novo refresh é persistido
            expect(prismaRefreshMock.create).toHaveBeenCalled();
            expect(tokens.accessToken).toBe("fake-access-token");
        });

        it("deve rejeitar quando refresh token não existir", async () => {
            prismaRefreshMock.findUnique.mockResolvedValue(null);

            await expect(AuthService.refresh("inexistente")).rejects.toMatchObject({
                status: 401,
            });
            expect(prismaRefreshMock.delete).not.toHaveBeenCalled();
        });

        it("deve rejeitar quando refresh token estiver revogado", async () => {
            prismaRefreshMock.findUnique.mockResolvedValue({
                ...refreshTokenStub,
                revoked: true,
            });

            await expect(AuthService.refresh("revogado")).rejects.toMatchObject({
                status: 401,
            });
            expect(prismaRefreshMock.delete).not.toHaveBeenCalled();
        });

        it("deve rejeitar quando refresh token estiver expirado", async () => {
            prismaRefreshMock.findUnique.mockResolvedValue({
                ...refreshTokenStub,
                expiresAt: new Date(Date.now() - 1000), // já passou
            });

            await expect(AuthService.refresh("expirado")).rejects.toMatchObject({
                status: 401,
            });
        });
    });

    // ──────────────────────────────────────────────
    // logout
    // ──────────────────────────────────────────────
    describe("logout", () => {
        it("deve chamar deleteMany com o token informado", async () => {
            prismaRefreshMock.deleteMany.mockResolvedValue({ count: 1 } as any);

            await AuthService.logout("algum-token");

            expect(prismaRefreshMock.deleteMany).toHaveBeenCalledWith({
                where: { token: "algum-token" },
            });
        });

        it("não deve lançar quando token não existir (count = 0)", async () => {
            prismaRefreshMock.deleteMany.mockResolvedValue({ count: 0 } as any);

            await expect(AuthService.logout("nao-existe")).resolves.not.toThrow();
        });
    });
});
