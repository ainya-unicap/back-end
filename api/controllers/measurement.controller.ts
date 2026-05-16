
import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { MeasurementService } from "../services/measurement.service.js";
        
export class MeasurementController {
    static async create(req: Request, res: Response) {
        try {
            await MeasurementService.create(req.body);
            return res.status(201).json({ message: "created successfully" });
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
    