import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class FormularioService {
    static async findAllByUser(user_id: string) {
        if (!user_id) {
            throw new HttpError("user_id is required", 400);
        }

        const formularios = await prisma.formulario.findMany({
            where: {
                user_id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                list: {
                    include: {
                        plant: true,
                    },
                },
            },
        });

        return formularios;
    }

    static async create(body: any) {
        const { list_id, user_id, type, observations } = body;

        if (!list_id || !user_id || !type) {
            throw new HttpError("list_id and type are required", 400);
        }

        const formulario = await prisma.formulario.create({
            data: {
                list_id,
                user_id,
                type,
                started_at: new Date(),
                ended_at: new Date(),
                observations: observations || "",
                synced: false,
            },
        });

        return formulario;
    }

    static async finalizar(id: string) {
    if (!id) {
        throw new HttpError("id é obrigatório", 400);
    }

    const formulario = await prisma.formulario.update({
        where: {
            id,
        },
        data: {
            ended_at: new Date(),
            synced: true,
        },
    });

    return formulario;
}

    static async sync(id: string, body: any) {
        if (!id) {
            throw new HttpError("id é obrigatório", 400);
        }

        const { formulario, checklist, measurements, photos } = body;

        const result = await prisma.$transaction(async (tx) => {
            const updatedFormulario = await tx.formulario.update({
                where: {
                    id,
                },
                data: {
                    type: formulario?.type,
                    observations: formulario?.observations,
                    started_at: formulario?.started_at
                        ? new Date(formulario.started_at)
                        : undefined,
                    ended_at: formulario?.ended_at
                        ? new Date(formulario.ended_at)
                        : new Date(),
                    synced: true,
                },
            });

            if (Array.isArray(checklist) && checklist.length > 0) {
                await tx.checklist.createMany({
                    data: checklist.map((item: { template_id: string; checked?: boolean }) => ({
                        form_id: id,
                        template_id: item.template_id,
                        checked: item.checked ?? false,
                    })),
                    skipDuplicates: true,
                });
            }

            if (Array.isArray(measurements) && measurements.length > 0) {
                await tx.measurement.createMany({
                    data: measurements.map((item: { template_id: string; value?: number }) => ({
                        form_id: id,
                        template_id: item.template_id,
                        value: item.value ?? 0,
                    })),
                    skipDuplicates: true,
                });
            }

            if (Array.isArray(photos) && photos.length > 0) {
                await tx.photo.createMany({
                    data: photos.map((item: { url: string }) => ({
                        form_id: id,
                        url: item.url,
                    })),
                });
            }

            return updatedFormulario;
        });

        return result;
    }

    static async findById(id: string) {
        if (!id) {
            throw new HttpError("id é obrigatório", 400);
        }

        const formulario = await prisma.formulario.findUnique({
            where: {
                id,
            },
            include: {
                list: {
                    include: {
                        plant: true,
                        canteiro: true,
                    },
                },
                checklists: {
                    include: {
                        template: true,
                    },
                },
                measurements: {
                    include: {
                        template: true,
                    },
                },
                photos: true,
            },
        });

        if (!formulario) {
            throw new HttpError("Formulário não encontrado", 404);
        }

        return formulario;
    }

    static async getChecklist(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        return prisma.checklist.findMany({
            where: { form_id: id },
            include: {
                template: {
                    select: { id: true, field_name: true, unit: true },
                },
            },
        });
    }

    static async getMeasurements(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        return prisma.measurement.findMany({
            where: { form_id: id },
            include: {
                template: {
                    select: { id: true, field_name: true, unit: true },
                },
            },
        });
    }

    static async getPhotos(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        return prisma.photo.findMany({
            where: { form_id: id },
            orderBy: { takenAt: "desc" },
        });
    }

    static async update(id: string, body: any) {
        if (!id) {
            throw new HttpError("id é obrigatório", 400);
        }

        const { type, observations, started_at, ended_at, synced } = body;

        const formulario = await prisma.formulario.update({
            where: {
                id,
            },
            data: {
                type,
                observations,
                started_at: started_at ? new Date(started_at) : undefined,
                ended_at: ended_at ? new Date(ended_at) : undefined,
                synced,
            },
        });

        return formulario;
    }

    // Remove o formulário e tudo que depende dele (checklist, measurements, photos).
    // Só o dono pode deletar.
    static async delete(id: string, userId: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const formulario = await prisma.formulario.findUnique({
            where: { id },
            include: { photos: true },
        });

        if (!formulario) throw new HttpError("Formulário não encontrado", 404);
        if (formulario.user_id !== userId) {
            throw new HttpError("Você só pode deletar os próprios formulários", 403);
        }

        // Apaga filhos em transação para manter integridade.
        // (Sem onDelete cascade no schema, fazemos manual.)
        await prisma.$transaction([
            prisma.checklist.deleteMany({ where: { form_id: id } }),
            prisma.measurement.deleteMany({ where: { form_id: id } }),
            prisma.photo.deleteMany({ where: { form_id: id } }),
            prisma.formulario.delete({ where: { id } }),
        ]);

        return formulario;
    }
}