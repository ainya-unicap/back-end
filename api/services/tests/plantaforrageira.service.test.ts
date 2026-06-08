// Testes unitários do PlantaForrageiraService.
// MOCK do Prisma (plantaForrageira) e STUBS de planta.

import { PlantaForrageiraService } from "../plantaforrageira.service";
import { prisma } from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    prisma: {
        plantaForrageira: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const plantaMock = prisma.plantaForrageira as jest.Mocked<typeof prisma.plantaForrageira>;

const plantaStub = {
    id: "p1",
    name: "Capim Elefante",
    category: "GRAMINEA_PORTE_ALTO",
    description: "Alto rendimento",
    semester_focus: 1,
} as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("PlantaForrageiraService", () => {
    describe("findAll", () => {
        it("deve retornar todas as plantas quando nenhuma categoria é informada", async () => {
            plantaMock.findMany.mockResolvedValue([plantaStub] as any);

            const result = await PlantaForrageiraService.findAll();

            expect(plantaMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    orderBy: { name: "asc" },
                })
            );
            expect(result).toEqual([plantaStub]);
        });

        it("deve filtrar por categoria válida", async () => {
            plantaMock.findMany.mockResolvedValue([plantaStub] as any);

            await PlantaForrageiraService.findAll("CACTACEA");

            expect(plantaMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { category: "CACTACEA" } })
            );
        });

        it("deve lançar 400 quando categoria inválida", async () => {
            await expect(
                PlantaForrageiraService.findAll("CATEGORIA_INVENTADA")
            ).rejects.toMatchObject({ status: 400 });
            expect(plantaMock.findMany).not.toHaveBeenCalled();
        });
    });

    describe("findById", () => {
        it("deve retornar a planta quando existir", async () => {
            plantaMock.findUnique.mockResolvedValue(plantaStub);

            const result = await PlantaForrageiraService.findById("p1");

            expect(plantaMock.findUnique).toHaveBeenCalledWith({ where: { id: "p1" } });
            expect(result).toEqual(plantaStub);
        });

        it("deve lançar 404 quando não encontrada", async () => {
            plantaMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantaForrageiraService.findById("nope")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(PlantaForrageiraService.findById("")).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    // ──────────────────────────────────────────────
    // create
    // ──────────────────────────────────────────────
    describe("create", () => {
        const novaPlanta = {
            name: "Brachiaria",
            category: "GRAMINEA_PORTE_ALTO",
            description: "Forrageira tropical",
            semester_focus: "AMBOS",
        };

        it("deve criar quando todos os campos válidos", async () => {
            plantaMock.create.mockResolvedValue({ id: "p1", ...novaPlanta } as any);

            const result = await PlantaForrageiraService.create(novaPlanta);

            expect(plantaMock.create).toHaveBeenCalledWith({ data: novaPlanta });
            expect(result.id).toBe("p1");
        });

        it("deve lançar 400 quando faltar algum campo obrigatório", async () => {
            await expect(
                PlantaForrageiraService.create({ ...novaPlanta, name: "" } as any)
            ).rejects.toMatchObject({ status: 400 });
            expect(plantaMock.create).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando categoria for inválida", async () => {
            await expect(
                PlantaForrageiraService.create({ ...novaPlanta, category: "INVALIDA" })
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 400 quando semester_focus for inválido", async () => {
            await expect(
                PlantaForrageiraService.create({ ...novaPlanta, semester_focus: "TERCEIRO" })
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    // ──────────────────────────────────────────────
    // update
    // ──────────────────────────────────────────────
    describe("update", () => {
        it("deve atualizar apenas campos enviados", async () => {
            plantaMock.findUnique.mockResolvedValue(plantaStub);
            plantaMock.update.mockResolvedValue({ ...plantaStub, name: "Novo Nome" } as any);

            await PlantaForrageiraService.update("p1", { name: "Novo Nome" });

            expect(plantaMock.update).toHaveBeenCalledWith({
                where: { id: "p1" },
                data: { name: "Novo Nome" },
            });
        });

        it("deve lançar 404 quando não existir", async () => {
            plantaMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantaForrageiraService.update("nope", { name: "x" })
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 400 quando body vazio", async () => {
            plantaMock.findUnique.mockResolvedValue(plantaStub);

            await expect(
                PlantaForrageiraService.update("p1", {})
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 400 quando categoria nova for inválida", async () => {
            plantaMock.findUnique.mockResolvedValue(plantaStub);

            await expect(
                PlantaForrageiraService.update("p1", { category: "INVALIDA" })
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    // ──────────────────────────────────────────────
    // delete
    // ──────────────────────────────────────────────
    describe("delete", () => {
        const semDependencias = {
            ...plantaStub,
            _count: { canteiros: 0, listaDeFormularios: 0, plantTemplates: 0 },
        };

        it("deve apagar quando não houver dependências", async () => {
            plantaMock.findUnique.mockResolvedValue(semDependencias);
            plantaMock.delete.mockResolvedValue(plantaStub);

            const result = await PlantaForrageiraService.delete("p1");

            expect(plantaMock.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
            expect(result).toEqual(plantaStub);
        });

        it("deve lançar 409 quando houver canteiros", async () => {
            plantaMock.findUnique.mockResolvedValue({
                ...plantaStub,
                _count: { canteiros: 2, listaDeFormularios: 0, plantTemplates: 0 },
            });

            await expect(
                PlantaForrageiraService.delete("p1")
            ).rejects.toMatchObject({ status: 409 });
            expect(plantaMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 404 quando não existir", async () => {
            plantaMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantaForrageiraService.delete("nope")
            ).rejects.toMatchObject({ status: 404 });
        });
    });
});
