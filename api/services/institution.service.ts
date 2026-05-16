
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";

export class InstitutionService {
    static async create(body: any) {
        const { name } = body;

        if (!name) {
            throw new HttpError("Name is required", 400);
        }

        const institution = await prisma.institution.create({
            data: {
                name,
            },
        });
        return await prisma.institution.findUnique({
            where: {
                id: institution.id,
            },
        });
    }

    static async getAll() {
        return await prisma.institution.findMany();
    }
}
    