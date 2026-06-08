import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { FormularioService } from "../services/formulario.service.js";

export class FormularioController {
    static async findAllByUser(req: Request, res: Response) {
        try {
            const userIdParam = req.params.userId;
            const userIdQuery = req.query.user_id;
            const userId =
                userIdParam ?? (typeof userIdQuery === "string" ? userIdQuery : "");

            const formularios = await FormularioService.findAllByUser(userId);

            return res.status(200).json({
                data: formularios,
                error: null,
                message: "Formulários encontrados com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao buscar formulários",
            });
        }
    }

    static async getChecklist(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const checklist = await FormularioService.getChecklist(id);
            return res.status(200).json(checklist);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async getMeasurements(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const measurements = await FormularioService.getMeasurements(id);
            return res.status(200).json(measurements);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async getPhotos(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const photos = await FormularioService.getPhotos(id);
            return res.status(200).json(photos);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            // user_id sempre vem do JWT (requireAuth) — body não controla mais.
            const formulario = await FormularioService.create({
                ...req.body,
                user_id: req.user!.id,
            });

            return res.status(201).json({
                data: formulario,
                error: null,
                message: "Formulário criado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao criar formulário",
            });
        }
    }

    static async finalizar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const formulario = await FormularioService.finalizar(id);

            return res.status(200).json({
                data: formulario,
                error: null,
                message: "Formulário finalizado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao finalizar formulário",
            });
        }
    }

    static async sync(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const formulario = await FormularioService.sync(id, req.body);

            return res.status(200).json({
                data: formulario,
                error: null,
                message: "Formulário sincronizado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao sincronizar formulário",
            });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const formulario = await FormularioService.findById(id);

            return res.status(200).json({
                data: formulario,
                error: null,
                message: "Formulário encontrado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao buscar formulário",
            });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const formulario = await FormularioService.update(id, req.body);

            return res.status(200).json({
                data: formulario,
                error: null,
                message: "Formulário atualizado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao atualizar formulário",
            });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const formulario = await FormularioService.delete(id, req.user!.id);
            return res.status(200).json({
                data: formulario,
                error: null,
                message: "Formulário removido com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao remover formulário",
            });
        }
    }
}