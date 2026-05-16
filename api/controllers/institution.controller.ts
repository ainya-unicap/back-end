
import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { InstitutionService } from "../services/institution.service.js";
        
export class InstitutionController {
    static async create(req: Request, res: Response) {
        try {
            await InstitutionService.create(req.body);
            return res.status(201).json({ message: "created successfully" });
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const institutions = await InstitutionService.getAll();
            return res.status(200).json(institutions);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
    