import { prisma } from "../../lib/prisma";
import { HttpError } from "../core/httpError";

export class CanteiroService {
    static async findByUser(userId: string) {
        if (!userId) throw new HttpError("userId é obrigatório", 400);

        return prisma.canteiro.findMany({
            where: { userId },
            include: {
                plantaForrageira: {
                    select: { id: true, nome: true, categoria: true },
                },
                listaFormularios: {
                    include: {
                        plantaForrageira: {
                            select: { id: true, nome: true },
                        },
                        _count: {
                            select: { formularios: true },
                        },
                    },
                },
            },
        });
    }

    static async create(body: { userId: string; plantId: string; nome: string }) {
        const { userId, plantId, nome } = body;
        if (!userId || !plantId || !nome) {
            throw new HttpError("userId, plantId e nome são obrigatórios", 400);
        }
        return prisma.canteiro.create({ data: { userId, plantId, nome } });
    }
}
