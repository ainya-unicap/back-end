import { prisma } from "../../lib/prisma";
import { HttpError } from "../core/httpError";

export class ListaFormulariosService {
    static async create(body: {
        canteiroId: string;
        plantId: string;
        createdById: string;
        nome: string;
    }) {
        const { canteiroId, plantId, createdById, nome } = body;
        if (!canteiroId || !plantId || !createdById || !nome) {
            throw new HttpError(
                "canteiroId, plantId, createdById e nome são obrigatórios",
                400
            );
        }
        return prisma.listaFormularios.create({
            data: { canteiroId, plantId, createdById, nome },
            include: {
                plantaForrageira: {
                    select: { id: true, nome: true, categoria: true },
                },
            },
        });
    }

    static async findById(listaId: string) {
        const lista = await prisma.listaFormularios.findUnique({
            where: { id: listaId },
            include: {
                plantaForrageira: {
                    select: { id: true, nome: true, categoria: true },
                },
                formularios: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        tipo: true,
                        synced: true,
                        startedAt: true,
                        endedAt: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!lista) throw new HttpError("Lista de formulários não encontrada", 404);
        return lista;
    }
}
