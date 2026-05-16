import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../core/httpError.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const isDev = process.env.NODE_ENV === "development";

export class AuthService {
    static async login(body: any) {
        const { email, password } = body;

        if (!email || !password) {
            throw new HttpError("Email and password are required", 400);
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                institution: true,
            },
        });

        if (!user) {
            if (isDev) {
                throw new HttpError("User not found", 404);
            } else {
                throw new HttpError("Invalid credentials", 401);
            }
        }

        const ok = await argon2.verify(user.password, password)

        if (!ok) {
            if (isDev) {
                throw new HttpError("Invalid password", 401);
            } else {
                throw new HttpError("Invalid credentials", 401);
            }
        }

        const tokens = await AuthService.generateTokens(user.id);

        return tokens;
    }

    private static async generateTokens(userId: string) {
        const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });

        // Geramos um token aleatório e opaco para o Refresh
        const refreshTokenValue = crypto.randomBytes(40).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

        // Salvamos no banco (Usando o model que criamos no Prisma)
        await prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId: userId,
                expiresAt: expiresAt,
            }
        });

        return { accessToken, refreshToken: refreshTokenValue };
    }

    static async refresh(token: string) {
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            throw new HttpError("Invalid or expired refresh token", 401);
        }

        // Opcional: Deletar o token antigo (Refresh Token Rotation)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        // Gera um novo par
        return this.generateTokens(storedToken.userId);
    }

    static async logout(token: string) {
        await prisma.refreshToken.deleteMany({
            where: { token }
        });
    }


}
