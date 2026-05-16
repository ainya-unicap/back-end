import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class CanteiroService {
    static async findByUser(userId: string) {
        if (!userId) throw new HttpError("userId é obrigatório", 400);

        return prisma.canteiro.findMany({
            where: { user_id: userId },
            include: {
                plant: {
                    select: { id: true, name: true, category: true },
                },
                listaDeFormularios: {
                    include: {
                        plant: {
                            select: { id: true, name: true },
                        },
                        _count: {
                            select: { formularios: true },
                        },
                    },
                },
            },
        });
    }

    static async create(body: { user_id: string; plant_id: string; name: string }) {
        const { user_id, plant_id, name } = body;
        if (!user_id || !plant_id || !name) {
            throw new HttpError("user_id, plant_id e name são obrigatórios", 400);
        }
        return prisma.canteiro.create({ data: { user_id, plant_id, name } });
    }
}
