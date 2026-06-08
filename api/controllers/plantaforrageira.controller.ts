import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { PlantaForrageiraService } from "../services/plantaforrageira.service.js";

export class PlantaForrageiraController {
    static async findAll(req: Request, res: Response) {
        try {
            const { category } = req.query;
            const plantas = await PlantaForrageiraService.findAll(
                category as string | undefined
            );
            return res.status(200).json(plantas);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const planta = await PlantaForrageiraService.findById(id);
            return res.status(200).json(planta);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const planta = await PlantaForrageiraService.create(req.body);
            return res.status(201).json(planta);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await PlantaForrageiraService.update(id, req.body);
            return res.status(200).json(updated);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await PlantaForrageiraService.delete(id);
            return res.status(200).json({
                message: "Planta forrageira removida com sucesso",
                data: deleted,
            });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
