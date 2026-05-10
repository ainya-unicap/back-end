import { Request, Response } from "express";
import { HttpError } from "../core/httpError";
import { ListaFormulariosService } from "../services/listaFormularios.service";

export class ListaFormulariosController {
    static async create(req: Request, res: Response) {
        try {
            const lista = await ListaFormulariosService.create(req.body);
            return res.status(201).json(lista);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const { listaId } = req.params;
            const lista = await ListaFormulariosService.findById(listaId);
            return res.status(200).json(lista);
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    }
}
