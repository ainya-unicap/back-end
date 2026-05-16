import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class ListaDeFormulariosService {
    static async create(body: {
        canteiro_id: string;
        plant_id: string;
        created_by: string;
        name?: string;
    }) {
        const { canteiro_id, plant_id, created_by, name } = body;
        if (!canteiro_id || !plant_id || !created_by) {
            throw new HttpError(
                "canteiro_id, plant_id e created_by são obrigatórios",
                400
            );
        }
        return prisma.listaDeFormularios.create({
            data: { canteiro_id, plant_id, created_by, name },
            include: {
                plant: { select: { id: true, name: true, category: true } },
            },
        });
    }

    static async findById(listaId: string) {
        const lista = await prisma.listaDeFormularios.findUnique({
            where: { id: listaId },
            include: {
                plant: { select: { id: true, name: true, category: true } },
                formularios: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        type: true,
                        synced: true,
                        started_at: true,
                        ended_at: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!lista) throw new HttpError("Lista de formulários não encontrada", 404);
        return lista;
    }
}
