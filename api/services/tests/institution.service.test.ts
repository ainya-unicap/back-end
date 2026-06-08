// Testes unitários do InstitutionService.
// MOCK do Prisma (institution) e STUBS de instituição.

import { InstitutionService } from "../institution.service";
import { prisma } from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    prisma: {
        institution: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const institutionMock = prisma.institution as jest.Mocked<typeof prisma.institution>;

const institutionStub = { id: "inst-1", name: "UNICAP" } as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("InstitutionService", () => {
    describe("create", () => {
        it("deve criar instituição e retornar via findUnique", async () => {
            institutionMock.create.mockResolvedValue(institutionStub);
            institutionMock.findUnique.mockResolvedValue(institutionStub);

            const result = await InstitutionService.create({ name: "UNICAP" });

            expect(institutionMock.create).toHaveBeenCalledWith({
                data: { name: "UNICAP" },
            });
            expect(institutionMock.findUnique).toHaveBeenCalledWith({
                where: { id: "inst-1" },
            });
            expect(result).toEqual(institutionStub);
        });

        it("deve lançar 400 quando name estiver ausente", async () => {
            await expect(
                InstitutionService.create({})
            ).rejects.toMatchObject({ status: 400 });

            expect(institutionMock.create).not.toHaveBeenCalled();
        });
    });

    describe("getAll", () => {
        it("deve retornar todas as instituições", async () => {
            institutionMock.findMany.mockResolvedValue([institutionStub] as any);

            const result = await InstitutionService.getAll();

            expect(institutionMock.findMany).toHaveBeenCalledTimes(1);
            expect(result).toEqual([institutionStub]);
        });
    });

    // ──────────────────────────────────────────────
    // findById
    // ──────────────────────────────────────────────
    describe("findById", () => {
        it("deve retornar instituição com _count quando existir", async () => {
            const withCount = { ...institutionStub, _count: { users: 2, turmas: 1 } };
            institutionMock.findUnique.mockResolvedValue(withCount);

            const result = await InstitutionService.findById("inst-1");

            expect(result).toEqual(withCount);
        });

        it("deve lançar 404 quando não existir", async () => {
            institutionMock.findUnique.mockResolvedValue(null);

            await expect(
                InstitutionService.findById("nope")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(
                InstitutionService.findById("")
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    // ──────────────────────────────────────────────
    // update
    // ──────────────────────────────────────────────
    describe("update", () => {
        it("deve atualizar o name", async () => {
            institutionMock.findUnique.mockResolvedValue(institutionStub);
            institutionMock.update.mockResolvedValue({ ...institutionStub, name: "Novo Nome" });

            const result = await InstitutionService.update("inst-1", { name: "Novo Nome" });

            expect(institutionMock.update).toHaveBeenCalledWith({
                where: { id: "inst-1" },
                data: { name: "Novo Nome" },
            });
            expect(result.name).toBe("Novo Nome");
        });

        it("deve lançar 400 quando name for muito curto", async () => {
            await expect(
                InstitutionService.update("inst-1", { name: "A" })
            ).rejects.toMatchObject({ status: 400 });
            expect(institutionMock.update).not.toHaveBeenCalled();
        });

        it("deve lançar 404 quando não existir", async () => {
            institutionMock.findUnique.mockResolvedValue(null);

            await expect(
                InstitutionService.update("nope", { name: "Nome OK" })
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    // ──────────────────────────────────────────────
    // delete
    // ──────────────────────────────────────────────
    describe("delete", () => {
        it("deve apagar quando não houver users nem turmas", async () => {
            institutionMock.findUnique.mockResolvedValue({
                ...institutionStub,
                _count: { users: 0, turmas: 0 },
            });
            institutionMock.delete.mockResolvedValue(institutionStub);

            const result = await InstitutionService.delete("inst-1");

            expect(institutionMock.delete).toHaveBeenCalledWith({ where: { id: "inst-1" } });
            expect(result).toEqual(institutionStub);
        });

        it("deve lançar 409 quando houver users vinculados", async () => {
            institutionMock.findUnique.mockResolvedValue({
                ...institutionStub,
                _count: { users: 3, turmas: 0 },
            });

            await expect(
                InstitutionService.delete("inst-1")
            ).rejects.toMatchObject({ status: 409 });
            expect(institutionMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 409 quando houver turmas vinculadas", async () => {
            institutionMock.findUnique.mockResolvedValue({
                ...institutionStub,
                _count: { users: 0, turmas: 1 },
            });

            await expect(
                InstitutionService.delete("inst-1")
            ).rejects.toMatchObject({ status: 409 });
            expect(institutionMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 404 quando não existir", async () => {
            institutionMock.findUnique.mockResolvedValue(null);

            await expect(
                InstitutionService.delete("nope")
            ).rejects.toMatchObject({ status: 404 });
        });
    });
});
