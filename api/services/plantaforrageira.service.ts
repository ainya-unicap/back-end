import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

const CATEGORIAS_VALIDAS = [
    "CACTACEA",
    "CULTURA_ANUAL",
    "GRAMINEA_PORTE_ALTO",
    "GRAMINEA_PORTE_BAIXO",
    "GRAMINEA_PORTE_MEDIO",
    "LEGUMINOSA_ARBUSTIVA",
    "LEGUMINOSA_HERBACEA",
    "OLEAGINOSA_FORRAGEIRA",
];

const SEMESTRES_VALIDOS = ["PRIMEIRO", "SEGUNDO", "AMBOS"];

export class PlantaForrageiraService {
    static async findAll(category?: string) {
        if (category && !CATEGORIAS_VALIDAS.includes(category)) {
            throw new HttpError(
                `Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(", ")}`,
                400
            );
        }

        const where = category ? { category } : {};

        return prisma.plantaForrageira.findMany({
            where,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                category: true,
                description: true,
                semester_focus: true,
            },
        });
    }

    static async findById(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const planta = await prisma.plantaForrageira.findUnique({
            where: { id },
        });

        if (!planta) throw new HttpError("Planta forrageira não encontrada", 404);

        return planta;
    }

    static async create(body: {
        name: string;
        category: string;
        description: string;
        semester_focus: string;
    }) {
        const { name, category, description, semester_focus } = body;

        if (!name || !category || !description || !semester_focus) {
            throw new HttpError(
                "name, category, description e semester_focus são obrigatórios",
                400
            );
        }

        if (!CATEGORIAS_VALIDAS.includes(category)) {
            throw new HttpError(
                `Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(", ")}`,
                400
            );
        }

        if (!SEMESTRES_VALIDOS.includes(semester_focus)) {
            throw new HttpError(
                `semester_focus inválido. Use: ${SEMESTRES_VALIDOS.join(", ")}`,
                400
            );
        }

        return prisma.plantaForrageira.create({
            data: { name, category, description, semester_focus },
        });
    }

    static async update(
        id: string,
        body: {
            name?: string;
            category?: string;
            description?: string;
            semester_focus?: string;
        }
    ) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const planta = await prisma.plantaForrageira.findUnique({ where: { id } });
        if (!planta) throw new HttpError("Planta forrageira não encontrada", 404);

        const data: any = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.description !== undefined) data.description = body.description;
        if (body.category !== undefined) {
            if (!CATEGORIAS_VALIDAS.includes(body.category)) {
                throw new HttpError(
                    `Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(", ")}`,
                    400
                );
            }
            data.category = body.category;
        }
        if (body.semester_focus !== undefined) {
            if (!SEMESTRES_VALIDOS.includes(body.semester_focus)) {
                throw new HttpError(
                    `semester_focus inválido. Use: ${SEMESTRES_VALIDOS.join(", ")}`,
                    400
                );
            }
            data.semester_focus = body.semester_focus;
        }

        if (Object.keys(data).length === 0) {
            throw new HttpError("Nenhum campo válido enviado para atualização", 400);
        }

        return prisma.plantaForrageira.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const planta = await prisma.plantaForrageira.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        canteiros: true,
                        listaDeFormularios: true,
                        plantTemplates: true,
                    },
                },
            },
        });

        if (!planta) throw new HttpError("Planta forrageira não encontrada", 404);

        const c = planta._count;
        if (c.canteiros > 0 || c.listaDeFormularios > 0 || c.plantTemplates > 0) {
            throw new HttpError(
                `Não é possível excluir: planta tem ${c.canteiros} canteiro(s), ${c.listaDeFormularios} lista(s) e ${c.plantTemplates} template(s) vinculados`,
                409
            );
        }

        return prisma.plantaForrageira.delete({ where: { id } });
    }
}
