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
}
