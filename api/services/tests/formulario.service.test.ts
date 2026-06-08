// Testes unitários do FormularioService.
// MOCK do Prisma (formulario, checklist, measurement, photo, $transaction)
// e STUBS para formulário, checklist, measurement, photo.

import { FormularioService } from "../formulario.service";
import { prisma } from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    prisma: {
        formulario: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        checklist: { findMany: jest.fn(), deleteMany: jest.fn() },
        measurement: { findMany: jest.fn(), deleteMany: jest.fn() },
        photo: { findMany: jest.fn(), deleteMany: jest.fn() },
        $transaction: jest.fn(),
    },
}));

const formMock = prisma.formulario as jest.Mocked<typeof prisma.formulario>;
const checklistMock = prisma.checklist as jest.Mocked<typeof prisma.checklist>;
const measurementMock = prisma.measurement as jest.Mocked<typeof prisma.measurement>;
const photoMock = prisma.photo as jest.Mocked<typeof prisma.photo>;
const transactionMock = prisma.$transaction as unknown as jest.Mock;

const formularioStub = {
    id: "form-1",
    list_id: "list-1",
    user_id: "user-1",
    type: "DIARIO",
    observations: "",
    started_at: new Date("2026-01-01"),
    ended_at: new Date("2026-01-01"),
    synced: false,
} as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("FormularioService", () => {
    describe("findAllByUser", () => {
        it("deve retornar formulários do usuário ordenados desc", async () => {
            formMock.findMany.mockResolvedValue([formularioStub] as any);

            const result = await FormularioService.findAllByUser("user-1");

            expect(formMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { user_id: "user-1" },
                    orderBy: { createdAt: "desc" },
                })
            );
            expect(result).toEqual([formularioStub]);
        });

        it("deve lançar 400 quando user_id estiver vazio", async () => {
            await expect(
                FormularioService.findAllByUser("")
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    describe("create", () => {
        it("deve criar formulário com observations default vazia", async () => {
            formMock.create.mockResolvedValue(formularioStub);

            const result = await FormularioService.create({
                list_id: "list-1",
                user_id: "user-1",
                type: "DIARIO",
            });

            expect(formMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        list_id: "list-1",
                        user_id: "user-1",
                        type: "DIARIO",
                        observations: "",
                        synced: false,
                    }),
                })
            );
            expect(result).toEqual(formularioStub);
        });

        it("deve usar observations enviadas quando presentes", async () => {
            formMock.create.mockResolvedValue(formularioStub);

            await FormularioService.create({
                list_id: "list-1",
                user_id: "user-1",
                type: "DIARIO",
                observations: "Tudo certo",
            });

            const payload = formMock.create.mock.calls[0][0] as any;
            expect(payload.data.observations).toBe("Tudo certo");
        });

        it("deve lançar 400 quando campos obrigatórios ausentes", async () => {
            await expect(
                FormularioService.create({ list_id: "", user_id: "u", type: "x" })
            ).rejects.toMatchObject({ status: 400 });
            await expect(
                FormularioService.create({ list_id: "l", user_id: "", type: "x" })
            ).rejects.toMatchObject({ status: 400 });
            await expect(
                FormularioService.create({ list_id: "l", user_id: "u", type: "" })
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    describe("finalizar", () => {
        it("deve atualizar synced=true e ended_at no formulário", async () => {
            formMock.update.mockResolvedValue({ ...formularioStub, synced: true });

            const result = await FormularioService.finalizar("form-1");

            expect(formMock.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "form-1" },
                    data: expect.objectContaining({ synced: true }),
                })
            );
            expect(result.synced).toBe(true);
        });

        it("deve lançar 400 quando id estiver vazio", async () => {
            await expect(FormularioService.finalizar("")).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe("sync", () => {
        it("deve persistir formulário + checklist + measurements + photos numa transação", async () => {
            // Stub do callback que prisma.$transaction recebe
            const tx = {
                formulario: { update: jest.fn().mockResolvedValue(formularioStub) },
                checklist: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
                measurement: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
                photo: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
            };
            transactionMock.mockImplementation(async (cb: any) => cb(tx));

            const result = await FormularioService.sync("form-1", {
                formulario: { type: "DIARIO", observations: "x" },
                checklist: [{ template_id: "t1", checked: true }],
                measurements: [{ template_id: "t2", value: 10 }],
                photos: [{ url: "https://x/y.jpg" }],
            });

            expect(transactionMock).toHaveBeenCalled();
            expect(tx.formulario.update).toHaveBeenCalled();
            expect(tx.checklist.createMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: [{ form_id: "form-1", template_id: "t1", checked: true }],
                    skipDuplicates: true,
                })
            );
            expect(tx.measurement.createMany).toHaveBeenCalled();
            expect(tx.photo.createMany).toHaveBeenCalled();
            expect(result).toEqual(formularioStub);
        });

        it("não deve chamar createMany de arrays vazios", async () => {
            const tx = {
                formulario: { update: jest.fn().mockResolvedValue(formularioStub) },
                checklist: { createMany: jest.fn() },
                measurement: { createMany: jest.fn() },
                photo: { createMany: jest.fn() },
            };
            transactionMock.mockImplementation(async (cb: any) => cb(tx));

            await FormularioService.sync("form-1", {});

            expect(tx.checklist.createMany).not.toHaveBeenCalled();
            expect(tx.measurement.createMany).not.toHaveBeenCalled();
            expect(tx.photo.createMany).not.toHaveBeenCalled();
        });

        it("deve lançar 400 quando id estiver vazio", async () => {
            await expect(
                FormularioService.sync("", {})
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    describe("findById", () => {
        it("deve retornar formulário com relações", async () => {
            formMock.findUnique.mockResolvedValue(formularioStub);

            const result = await FormularioService.findById("form-1");

            expect(formMock.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: "form-1" } })
            );
            expect(result).toEqual(formularioStub);
        });

        it("deve lançar 404 quando não encontrado", async () => {
            formMock.findUnique.mockResolvedValue(null);

            await expect(
                FormularioService.findById("nope")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(FormularioService.findById("")).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe("getChecklist / getMeasurements / getPhotos", () => {
        it("getChecklist deve filtrar por form_id e incluir template", async () => {
            checklistMock.findMany.mockResolvedValue([] as any);

            await FormularioService.getChecklist("form-1");

            expect(checklistMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { form_id: "form-1" } })
            );
        });

        it("getMeasurements deve filtrar por form_id", async () => {
            measurementMock.findMany.mockResolvedValue([] as any);

            await FormularioService.getMeasurements("form-1");

            expect(measurementMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { form_id: "form-1" } })
            );
        });

        it("getPhotos deve filtrar por form_id e ordenar por takenAt", async () => {
            photoMock.findMany.mockResolvedValue([] as any);

            await FormularioService.getPhotos("form-1");

            expect(photoMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { form_id: "form-1" },
                    orderBy: { takenAt: "desc" },
                })
            );
        });

        it("getChecklist / getMeasurements / getPhotos devem lançar 400 para id vazio", async () => {
            await expect(FormularioService.getChecklist("")).rejects.toMatchObject({
                status: 400,
            });
            await expect(FormularioService.getMeasurements("")).rejects.toMatchObject({
                status: 400,
            });
            await expect(FormularioService.getPhotos("")).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe("update", () => {
        it("deve atualizar campos enviados e converter datas", async () => {
            formMock.update.mockResolvedValue(formularioStub);

            await FormularioService.update("form-1", {
                type: "FINAL",
                observations: "ok",
                started_at: "2026-01-02",
                ended_at: "2026-01-03",
                synced: true,
            });

            const arg = formMock.update.mock.calls[0][0] as any;
            expect(arg.where).toEqual({ id: "form-1" });
            expect(arg.data.type).toBe("FINAL");
            expect(arg.data.observations).toBe("ok");
            expect(arg.data.started_at).toBeInstanceOf(Date);
            expect(arg.data.ended_at).toBeInstanceOf(Date);
            expect(arg.data.synced).toBe(true);
        });

        it("deve lançar 400 quando id estiver vazio", async () => {
            await expect(
                FormularioService.update("", {})
            ).rejects.toMatchObject({ status: 400 });
        });
    });

    // ──────────────────────────────────────────────
    // delete (com ownership e cascata de filhos)
    // ──────────────────────────────────────────────
    describe("delete", () => {
        it("deve apagar formulário e filhos em transação (dono)", async () => {
            formMock.findUnique.mockResolvedValue({ ...formularioStub, photos: [] });
            transactionMock.mockResolvedValue([]);

            const result = await FormularioService.delete("form-1", "user-1");

            expect(transactionMock).toHaveBeenCalledTimes(1);
            // a transação inclui 4 operações: checklist, measurement, photo, formulario
            const ops = transactionMock.mock.calls[0][0];
            expect(Array.isArray(ops)).toBe(true);
            expect(ops.length).toBe(4);
            expect(result.id).toBe("form-1");
        });

        it("deve lançar 403 quando usuário não é dono", async () => {
            formMock.findUnique.mockResolvedValue({ ...formularioStub, photos: [] });

            await expect(
                FormularioService.delete("form-1", "outro-user")
            ).rejects.toMatchObject({ status: 403 });
            expect(transactionMock).not.toHaveBeenCalled();
        });

        it("deve lançar 404 quando não encontrado", async () => {
            formMock.findUnique.mockResolvedValue(null);

            await expect(
                FormularioService.delete("nope", "user-1")
            ).rejects.toMatchObject({ status: 404 });
        });

        it("deve lançar 400 quando id vazio", async () => {
            await expect(
                FormularioService.delete("", "user-1")
            ).rejects.toMatchObject({ status: 400 });
        });
    });
});
