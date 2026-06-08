// Testes unitários do PlantTemplateService.
// MOCK do Prisma (plantTemplate) e STUBS de template.

import { PlantTemplateService } from "../planttemplate.service";
import { prisma } from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    prisma: {
        plantTemplate: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const templateMock = prisma.plantTemplate as jest.Mocked<typeof prisma.plantTemplate>;

const templateStub = {
    id: "tpl-1",
    plant_id: "p1",
    field_name: "Altura",
    unit: "cm",
} as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("PlantTemplateService", () => {
    describe("findAllByPlant", () => {
        it("deve retornar templates filtrados por plant_id", async () => {
            templateMock.findMany.mockResolvedValue([templateStub] as any);

            const result = await PlantTemplateService.findAllByPlant("p1");

            expect(templateMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { plant_id: "p1" } })
            );
            expect(result).toEqual([templateStub]);
        });

        it("deve lançar 400 quando plant_id vazio", async () => {
            await expect(
                PlantTemplateService.findAllByPlant("")
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    describe("create", () => {
        it("deve criar template com plant_id, field_name e unit", async () => {
            templateMock.create.mockResolvedValue(templateStub);

            const result = await PlantTemplateService.create({
                plant_id: "p1",
                field_name: "Altura",
                unit: "cm",
            });

            expect(templateMock.create).toHaveBeenCalledWith({
                data: { plant_id: "p1", field_name: "Altura", unit: "cm" },
            });
            expect(result).toEqual(templateStub);
        });

        it("deve lançar 400 quando algum campo obrigatório está ausente", async () => {
            await expect(
                PlantTemplateService.create({ plant_id: "", field_name: "x", unit: "y" })
            ).rejects.toMatchObject({ status: 400 });
            await expect(
                PlantTemplateService.create({ plant_id: "p", field_name: "", unit: "y" })
            ).rejects.toMatchObject({ status: 400 });
            await expect(
                PlantTemplateService.create({ plant_id: "p", field_name: "x", unit: "" })
            ).rejects.toMatchObject({ status: 400 });
            expect(templateMock.create).not.toHaveBeenCalled();
        });
    });

    // ──────────────────────────────────────────────
    // findById
    // ──────────────────────────────────────────────
    describe("findById", () => {
        it("deve retornar o template quando existir", async () => {
            templateMock.findUnique.mockResolvedValue(templateStub);

            const result = await PlantTemplateService.findById("tpl-1");

            expect(result).toEqual(templateStub);
        });

        it("deve lançar 404 quando não existir", async () => {
            templateMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantTemplateService.findById("nope")
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    // ──────────────────────────────────────────────
    // update
    // ──────────────────────────────────────────────
    describe("update", () => {
        it("deve atualizar field_name e unit", async () => {
            templateMock.findUnique.mockResolvedValue(templateStub);
            templateMock.update.mockResolvedValue({ ...templateStub, unit: "mm" } as any);

            await PlantTemplateService.update("tpl-1", { unit: "mm" });

            expect(templateMock.update).toHaveBeenCalledWith({
                where: { id: "tpl-1" },
                data: { unit: "mm" },
            });
        });

        it("deve lançar 400 quando body vazio", async () => {
            templateMock.findUnique.mockResolvedValue(templateStub);

            await expect(
                PlantTemplateService.update("tpl-1", {})
            ).rejects.toMatchObject({ status: 400 });
        });

        it("deve lançar 404 quando não existir", async () => {
            templateMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantTemplateService.update("nope", { unit: "mm" })
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    // ──────────────────────────────────────────────
    // delete
    // ──────────────────────────────────────────────
    describe("delete", () => {
        it("deve apagar quando não houver dependências", async () => {
            templateMock.findUnique.mockResolvedValue({
                ...templateStub,
                _count: { checklists: 0, measurements: 0 },
            });
            templateMock.delete.mockResolvedValue(templateStub);

            await PlantTemplateService.delete("tpl-1");

            expect(templateMock.delete).toHaveBeenCalledWith({ where: { id: "tpl-1" } });
        });

        it("deve lançar 409 quando houver checklists vinculadas", async () => {
            templateMock.findUnique.mockResolvedValue({
                ...templateStub,
                _count: { checklists: 2, measurements: 0 },
            });

            await expect(
                PlantTemplateService.delete("tpl-1")
            ).rejects.toMatchObject({ status: 409 });
            expect(templateMock.delete).not.toHaveBeenCalled();
        });

        it("deve lançar 404 quando não existir", async () => {
            templateMock.findUnique.mockResolvedValue(null);

            await expect(
                PlantTemplateService.delete("nope")
            ).rejects.toMatchObject({ status: 404 });
        });
    });
});
