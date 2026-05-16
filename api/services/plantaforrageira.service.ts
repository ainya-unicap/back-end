import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

const CATEGORIAS_VALIDAS = ["GRAMINEA", "LEGUMINOSA", "CACTACEA", "OUTRO"];

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
}
