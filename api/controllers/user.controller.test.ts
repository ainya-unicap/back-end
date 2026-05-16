import { UserController } from "./user.controller.js";
import { UserService } from "../services/user.service.js";
import { HttpError } from "../core/httpError.js";
import { Request, Response } from "express";

jest.mock("../services/user.service");

const serviceMock = UserService as jest.Mocked<typeof UserService>;

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("UserController", () => {
    describe("create", () => {
        it("deve retornar 201 ao criar usuário com sucesso", async () => {
            serviceMock.create.mockResolvedValue(undefined);
            const req = { body: { name: "João", email: "joao@email.com", password: "123456" } } as Request;
            const res = mockRes();

            await UserController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "created successfully" });
        });

        it("deve retornar o status do HttpError em caso de falha", async () => {
            serviceMock.create.mockRejectedValue(new HttpError("Email já existe", 409));

            const req = { body: {} } as Request;
            const res = mockRes();

            await UserController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: "Email já existe" });
        });

        it("deve retornar 500 para erros inesperados", async () => {
            serviceMock.create.mockRejectedValue(new Error("Erro de banco"));

            const req = { body: {} } as Request;
            const res = mockRes();

            await UserController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});