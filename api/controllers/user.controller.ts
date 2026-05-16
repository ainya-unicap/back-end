
import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { UserService } from "../services/user.service.js";
        
export class UserController {
    static async create(req: Request, res: Response) {
        try {
            await UserService.create(req.body);
            return res.status(201).json({ message: "created successfully" });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const users = await UserService.getAll();
            return res.status(200).json(users);
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
    