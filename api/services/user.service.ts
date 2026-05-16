import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";
import argon2 from "argon2";

const isDev = process.env.NODE_ENV === "development";

export class UserService {
    static async create(body: any) {
        const { name, email, password, institution } = body;

        if (!name || !email || !password || !institution) {
            throw new HttpError("Name, email, institution and password are required", 400);
        }

        await prisma.user.create({
            data: {
                name,
                email,
                role: "aluno",
                institution: {
                    connect: {
                        id: institution,
                    },
                },
                password: await argon2.hash(password),
            },
            include: {
                institution: true,
            },
        });
    }

    static async getAll() {
        return await prisma.user.findMany();
    }
}
    