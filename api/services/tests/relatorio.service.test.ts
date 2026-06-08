// Testes unitários do RelatorioService (kebab-case, ./relatorio.service).
// MOCK do Prisma (relatorio, listaDeFormularios) + MOCK do UserCanteiroService.
// STUBS de relatório, lista e planta.

import { RelatorioService } from "../relatorio.service";
import { prisma } from "../../../lib/prisma";
import { UserCanteiroService } from "../usercanteiro.service";

jest.mock("../../../lib/prisma", () => ({
    prisma: {
        relatorio: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        listaDeFormularios: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("../usercanteiro.service", () => ({
    UserCanteiroService: {
        exists: jest.fn(),
    },
}));


const relMock = prisma.relatorio as jest.Mocked<typeof prisma.relatorio>;
const listaMock = prisma.listaDeFormularios as jest.Mocked<typeof prisma.listaDeFormularios>;
const existsMock = UserCanteiroService.exists as jest.Mock;

const relatorioStub = {
    id: "rel-1",
    user_id: "user-1",
    list_id: "lista-1",
    canteiro_id: "cant-1",
    status: "RASCUNHO",
    objective: "obj",
    introduction: "",
    development: "",
    final_thoughts: "",
    references: "",
    grade: 0,
    feedback: "",
    submittedAt: new Date("2026-01-01"),
} as any;

const listaStub = {
    id: "lista-1",
    canteiro_id: "cant-1",
    plant: { id: "p1", name: "Capim" },
} as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("RelatorioService (kebab)", () => {
    describe("getRelatoriosByUser", () => {
        it("deve retornar relatórios do usuário ordenados desc", async () => {
            relMock.findMany.mockResolvedValue([relatorioStub] as any);

            const result = await RelatorioService.getRelatoriosByUser("user-1");

            expect(relMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { user_id: "user-1" },
                    orderBy: { createdAt: "desc" },
                })
            );
            expect(result).toEqual([relatorioStub]);
        });
    });

    describe("createRelatorio", () => {
        it("deve criar relatório com objective gerado a partir da planta", async () => {
            listaMock.findUnique.mockResolvedValue(listaStub);
            existsMock.mockResolvedValue(true);
            relMock.create.mockResolvedValue(relatorioStub);

            const result = await RelatorioService.createRelatorio("user-1", "lista-1");

            expect(existsMock).toHaveBeenCalledWith("user-1", "cant-1");
            expect(relMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        user_id: "user-1",
                        list_id: "lista-1",
                        canteiro_id: "cant-1",
                        status: "RASCUNHO",
                        objective: expect.stringContaining("Capim"),
                    }),
                })
            );
            expect(result).toEqual(relatorioStub);
        });

        it("deve lançar 404 quando a lista não existir", async () => {
            listaMock.findUnique.mockResolvedValue(null);

            await expect(
                RelatorioService.createRelatorio("user-1", "lista-x")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 403 quando o usuário não está vinculado ao canteiro da lista", async () => {
            listaMock.findUnique.mockResolvedValue(listaStub);
            existsMock.mockResolvedValue(false);

            await expect(
                RelatorioService.createRelatorio("user-x", "lista-1")
            ).rejects.toMatchObject({ status: 403 });

            expect(relMock.create).not.toHaveBeenCalled();
        });
    });

    describe("getRelatorioById", () => {
        it("deve retornar o relatório quando existir", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            const result = await RelatorioService.getRelatorioById("rel-1");

            expect(result).toEqual(relatorioStub);
        });

        it("deve lançar 404 quando não encontrado", async () => {
            relMock.findUnique.mockResolvedValue(null);

            await expect(
                RelatorioService.getRelatorioById("nope")
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("updateObjective", () => {
        it("deve atualizar somente o campo objective (dono)", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);
            relMock.update.mockResolvedValue({ ...relatorioStub, objective: "novo" });

            const result = await RelatorioService.updateObjective("rel-1", "user-1", "novo");

            expect(relMock.update).toHaveBeenCalledWith({
                where: { id: "rel-1" },
                data: { objective: "novo" },
            });
            expect(result.objective).toBe("novo");
        });

        it("deve lançar 403 quando o usuário não é dono", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(
                RelatorioService.updateObjective("rel-1", "outro", "x")
            ).rejects.toMatchObject({ status: 403 });
            expect(relMock.update).not.toHaveBeenCalled();
        });
    });

    describe("updateSection", () => {
        it("deve atualizar uma seção válida em relatório em rascunho (dono)", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);
            relMock.update.mockResolvedValue({
                ...relatorioStub,
                introduction: "texto",
            });

            await RelatorioService.updateSection("rel-1", "user-1", "introduction", "texto");

            expect(relMock.update).toHaveBeenCalledWith({
                where: { id: "rel-1" },
                data: { introduction: "texto" },
            });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(
                RelatorioService.updateSection("", "user-1", "introduction" as any, "x")
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 400 quando seção inválida", async () => {
            await expect(
                RelatorioService.updateSection("rel-1", "user-1", "inexistente" as any, "x")
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 400 quando valor não for string", async () => {
            await expect(
                RelatorioService.updateSection("rel-1", "user-1", "introduction" as any, 42 as any)
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 404 quando relatório não existir", async () => {
            relMock.findUnique.mockResolvedValue(null);

            await expect(
                RelatorioService.updateSection("nope", "user-1", "introduction" as any, "x")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 403 quando o usuário não é dono", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(
                RelatorioService.updateSection("rel-1", "outro", "introduction" as any, "x")
            ).rejects.toMatchObject({ status: 403 });
            expect(relMock.update).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando relatório já submetido", async () => {
            relMock.findUnique.mockResolvedValue({ ...relatorioStub, status: "SUBMETIDO" });

            await expect(
                RelatorioService.updateSection("rel-1", "user-1", "introduction" as any, "x")
            ).rejects.toMatchObject({ status: 400 });
            expect(relMock.update).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("deve atualizar apenas seções válidas enviadas (dono)", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);
            relMock.update.mockResolvedValue(relatorioStub);

            await RelatorioService.update("rel-1", "user-1", {
                introduction: "a",
                development: "b",
                campo_ignorado: "c",
            });

            expect(relMock.update).toHaveBeenCalledWith({
                where: { id: "rel-1" },
                data: { introduction: "a", development: "b" },
            });
        });

        it("deve lançar 400 quando nenhum campo válido enviado", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(
                RelatorioService.update("rel-1", "user-1", { campo: "x" })
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 404 quando relatório não existe", async () => {
            relMock.findUnique.mockResolvedValue(null);

            await expect(
                RelatorioService.update("nope", "user-1", { introduction: "a" })
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 403 quando o usuário não é dono", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(
                RelatorioService.update("rel-1", "outro", { introduction: "a" })
            ).rejects.toMatchObject({ status: 403 });
        });

        it("deve lançar 400 quando relatório já submetido", async () => {
            relMock.findUnique.mockResolvedValue({ ...relatorioStub, status: "CORRIGIDO" });

            await expect(
                RelatorioService.update("rel-1", "user-1", { introduction: "a" })
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(
                RelatorioService.update("", "user-1", { introduction: "a" })
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    describe("submit", () => {
        it("deve submeter relatório em rascunho (dono)", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);
            relMock.update.mockResolvedValue({
                ...relatorioStub,
                status: "SUBMETIDO",
            });

            const result = await RelatorioService.submit("rel-1", "user-1");

            expect(relMock.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "rel-1" },
                    data: expect.objectContaining({ status: "SUBMETIDO" }),
                })
            );
            expect(result.status).toBe("SUBMETIDO");
        });

        it("deve lançar 404 quando relatório não existe", async () => {
            relMock.findUnique.mockResolvedValue(null);

            await expect(RelatorioService.submit("nope", "user-1")).rejects.toMatchObject({
                status: 404,
            });
        });

        it("deve lançar 403 quando o usuário não é dono", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(RelatorioService.submit("rel-1", "outro")).rejects.toMatchObject({
                status: 403,
            });
        });

        it("deve lançar 400 quando relatório já submetido", async () => {
            relMock.findUnique.mockResolvedValue({ ...relatorioStub, status: "SUBMETIDO" });

            await expect(RelatorioService.submit("rel-1", "user-1")).rejects.toMatchObject({
                status: 400,
            });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(RelatorioService.submit("", "user-1")).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    // ──────────────────────────────────────────────
    // delete (só dono + só em RASCUNHO)
    // ──────────────────────────────────────────────
    describe("delete", () => {
        it("deve apagar quando dono e status RASCUNHO", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);
            relMock.delete.mockResolvedValue(relatorioStub);

            const result = await RelatorioService.delete("rel-1", "user-1");

            expect(relMock.delete).toHaveBeenCalledWith({ where: { id: "rel-1" } });
            expect(result).toEqual(relatorioStub);
        });

        it("deve lançar 403 quando não é dono", async () => {
            relMock.findUnique.mockResolvedValue(relatorioStub);

            await expect(
                RelatorioService.delete("rel-1", "outro")
            ).rejects.toMatchObject({ status: 403 });
            expect(relMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando relatório já está SUBMETIDO", async () => {
            relMock.findUnique.mockResolvedValue({ ...relatorioStub, status: "SUBMETIDO" });

            await expect(
                RelatorioService.delete("rel-1", "user-1")
            ).rejects.toMatchObject({ status: 400 });
            expect(relMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando relatório já está CORRIGIDO", async () => {
            relMock.findUnique.mockResolvedValue({ ...relatorioStub, status: "CORRIGIDO" });

            await expect(
                RelatorioService.delete("rel-1", "user-1")
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 404 quando relatório não existe", async () => {
            relMock.findUnique.mockResolvedValue(null);

            await expect(
                RelatorioService.delete("nope", "user-1")
            ).rejects.toMatchObject({ status: 404 });
        });
    });
});
