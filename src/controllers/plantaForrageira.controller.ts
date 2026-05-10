import { Request, Response } from "express";
import { HttpError } from "../core/httpError";
import { PlantaForrageiraService } from "../services/plantaForrageira.service";

export class PlantaForrageiraController {
    static async findAll(req: Request, res: Response) {
        try {
            const { categoria } = req.query;
            const plantas = await PlantaForrageiraService.findAll(
                categoria as string | undefined
            );
            return res.status(200).json(plantas);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
