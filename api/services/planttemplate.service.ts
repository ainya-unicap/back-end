import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class PlantTemplateService {
    static async findAllByPlant(plant_id: string) {
        if (!plant_id) {
            throw new HttpError("plant_id é obrigatório", 400);
        }

        const templates = await prisma.plantTemplate.findMany({
            where: { plant_id },
            include: {
                planta_forrageira: {
                    select: { id: true, name: true, category: true },
                },
            },
        });

        return templates;
    }

    static async findById(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const template = await prisma.plantTemplate.findUnique({
            where: { id },
            include: {
                planta_forrageira: {
                    select: { id: true, name: true, category: true },
                },
            },
        });

        if (!template) throw new HttpError("Template não encontrado", 404);
        return template;
    }

    static async create(body: any) {
        const { plant_id, field_name, unit } = body;

        if (!plant_id || !field_name || !unit) {
            throw new HttpError("plant_id, field_name e unit são obrigatórios", 400);
        }

        const template = await prisma.plantTemplate.create({
            data: { plant_id, field_name, unit },
        });

        return template;
    }

    static async update(
        id: string,
        body: { field_name?: string; unit?: string }
    ) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const existente = await prisma.plantTemplate.findUnique({ where: { id } });
        if (!existente) throw new HttpError("Template não encontrado", 404);

        const data: any = {};
        if (body.field_name !== undefined) data.field_name = body.field_name;
        if (body.unit !== undefined) data.unit = body.unit;

        if (Object.keys(data).length === 0) {
            throw new HttpError("Informe field_name ou unit para atualizar", 400);
        }

        return prisma.plantTemplate.update({ where: { id }, data });
    }

    static async delete(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const template = await prisma.plantTemplate.findUnique({
            where: { id },
            include: {
                _count: { select: { checklists: true, measurements: true } },
            },
        });

        if (!template) throw new HttpError("Template não encontrado", 404);

        const c = template._count;
        if (c.checklists > 0 || c.measurements > 0) {
            throw new HttpError(
                `Não é possível excluir: template tem ${c.checklists} checklist(s) e ${c.measurements} medição(ões) vinculadas`,
                409
            );
        }

        return prisma.plantTemplate.delete({ where: { id } });
    }
}
