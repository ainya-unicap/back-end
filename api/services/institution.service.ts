import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class InstitutionService {
    static async create(body: any) {
        const { name } = body;

        if (!name) {
            throw new HttpError("Name is required", 400);
        }

        const institution = await prisma.institution.create({
            data: { name },
        });
        return await prisma.institution.findUnique({
            where: { id: institution.id },
        });
    }

    static async getAll() {
        return await prisma.institution.findMany({
            orderBy: { name: "asc" },
        });
    }

    static async findById(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const institution = await prisma.institution.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true, turmas: true } },
            },
        });

        if (!institution) throw new HttpError("Instituição não encontrada", 404);
        return institution;
    }

    static async update(id: string, body: { name?: string }) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const { name } = body;
        if (!name || name.trim().length < 2) {
            throw new HttpError("name é obrigatório e deve ter pelo menos 2 caracteres", 400);
        }

        const existente = await prisma.institution.findUnique({ where: { id } });
        if (!existente) throw new HttpError("Instituição não encontrada", 404);

        return prisma.institution.update({
            where: { id },
            data: { name },
        });
    }

    static async delete(id: string) {
        if (!id) throw new HttpError("id é obrigatório", 400);

        const institution = await prisma.institution.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true, turmas: true } },
            },
        });

        if (!institution) throw new HttpError("Instituição não encontrada", 404);

        // Bloqueia delete se houver users ou turmas vinculados — evita dados órfãos.
        if (institution._count.users > 0 || institution._count.turmas > 0) {
            throw new HttpError(
                `Não é possível excluir: instituição tem ${institution._count.users} usuário(s) e ${institution._count.turmas} turma(s) vinculados`,
                409
            );
        }

        return prisma.institution.delete({ where: { id } });
    }
}
