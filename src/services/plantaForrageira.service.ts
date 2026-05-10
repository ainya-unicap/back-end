import { prisma } from "../../lib/prisma";
import { CategoriaPlanta } from "@prisma/client";
import { HttpError } from "../core/httpError";

export class PlantaForrageiraService {
    static async findAll(categoria?: string) {
        const where = categoria
            ? { categoria: categoria as CategoriaPlanta }
            : {};

        const categorias = Object.values(CategoriaPlanta) as string[];
        if (categoria && !categorias.includes(categoria)) {
            throw new HttpError(
                `Categoria inválida. Use: ${categorias.join(", ")}`,
                400
            );
        }

        return prisma.plantaForrageira.findMany({
            where,
            orderBy: { nome: "asc" },
            select: {
                id: true,
                nome: true,
                categoria: true,
                descricao: true,
                semesterFocus: true,
            },
        });
    }
}
