
import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { AuthService } from "../services/auth.service.js";
        
export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const token = await AuthService.login(req.body);
            return res.status(200).json({ token });
        } catch (err: HttpError | any) {
            console.error("Error:", err);
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
    