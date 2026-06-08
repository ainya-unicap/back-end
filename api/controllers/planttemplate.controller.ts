import { Request, Response } from "express";
import { HttpError } from "../core/httpError.js";
import { PlantTemplateService } from "../services/planttemplate.service.js";

export class PlantTemplateController {
    static async findAllByPlant(req: Request, res: Response) {
        try {
            const plantIdParam = req.params.plantId;
            const plantIdQuery = req.query.plant_id;
            const plant_id =
                plantIdParam ?? (typeof plantIdQuery === "string" ? plantIdQuery : "");

            const templates = await PlantTemplateService.findAllByPlant(plant_id);

            return res.status(200).json({
                data: templates,
                error: null,
                message: "Templates da planta encontrados com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao buscar templates da planta",
            });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const template = await PlantTemplateService.findById(id);
            return res.status(200).json({
                data: template,
                error: null,
                message: "Template encontrado com sucesso",
            });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao buscar template",
            });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const template = await PlantTemplateService.create(req.body);

            return res.status(201).json({
                data: template,
                error: null,
                message: "Template da planta criado com sucesso",
            });
        } catch (err: HttpError | any) {
            console.error("Error:", err);

            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao criar template da planta",
            });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const template = await PlantTemplateService.update(id, req.body);
            return res.status(200).json({
                data: template,
                error: null,
                message: "Template atualizado com sucesso",
            });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao atualizar template",
            });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const template = await PlantTemplateService.delete(id);
            return res.status(200).json({
                data: template,
                error: null,
                message: "Template removido com sucesso",
            });
        } catch (err: HttpError | any) {
            return res.status(err.status || 500).json({
                data: null,
                error: err.message,
                message: "Erro ao remover template",
            });
        }
    }
}
